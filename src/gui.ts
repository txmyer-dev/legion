import { app, Tray, Menu, nativeImage, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { startNode } from './node.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray: Tray | null = null;
let stopCurrentNode: (() => void) | null = null;

const configPath = path.join(app.getPath('userData'), 'legion-config.json');

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load config:", e);
  }
  return { gatewayUrl: 'ws://localhost:9090' };
}

function saveConfig(config: any) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    // Hide dock icon on macOS, we just want a tray
    if (app.dock) app.dock.hide();

    // Create a simple blank tray icon
    // In production, replace with a real path to a 16x16 PNG: path.join(__dirname, '../assets/icon.png')
    const icon = nativeImage.createEmpty(); 
    tray = new Tray(icon);
    
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Legion AI Node', enabled: false },
      { type: 'separator' },
      { label: 'Status: Connected', enabled: false },
      { 
        label: 'Trigger Wake Word Manually', 
        click: () => {
          console.log("Triggering wake word from system tray...");
          // In a real app, we'd emit an event to node.ts to trigger the wake word
        }
      },
      { type: 'separator' },
      { 
        label: 'Settings...', 
        click: () => {
          const win = new BrowserWindow({ 
            width: 400, 
            height: 300, 
            title: "Legion Settings",
            webPreferences: {
              nodeIntegration: true,
              contextIsolation: false
            }
          });
          win.loadFile(path.join(__dirname, 'settings.html'));
        }
      },
      { label: 'Quit', click: () => {
        if (stopCurrentNode) stopCurrentNode();
        app.quit();
      }}
    ]);

    tray.setToolTip('Legion AI Assistant Node');
    tray.setContextMenu(contextMenu);

    // Initial load
    const currentConfig = loadConfig();
    stopCurrentNode = startNode(currentConfig.gatewayUrl);
    
    console.log(`System Tray GUI launched successfully. Node connected to ${currentConfig.gatewayUrl}`);

    // IPC Handlers
    ipcMain.handle('get-settings', () => {
      return loadConfig();
    });

    ipcMain.handle('save-settings', (event, newConfig) => {
      saveConfig(newConfig);
      
      // Restart node
      if (stopCurrentNode) {
        stopCurrentNode();
      }
      
      try {
        stopCurrentNode = startNode(newConfig.gatewayUrl);
        console.log(`Node restarted on new Gateway: ${newConfig.gatewayUrl}`);
        return { success: true };
      } catch (e) {
        console.error("Failed to restart node:", e);
        return { success: false, error: String(e) };
      }
    });
  });

  // Prevent electron from closing when settings window is closed
  app.on('window-all-closed', () => {
    // Keep app running in tray when windows are closed
  });
}
