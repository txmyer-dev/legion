import fs from 'fs';
import path from 'path';

export interface PluginDeclaration {
    name: string;
    description: string;
    parameters?: any;
}

export interface LegionPlugin {
    declaration: PluginDeclaration;
    execute: (args: any) => Promise<any>;
}

export class PluginManager {
    private plugins: Map<string, LegionPlugin> = new Map();

    constructor() {
        this.loadPlugins();
    }

    private loadPlugins() {
        const pluginsDir = __dirname;
        const files = fs.readdirSync(pluginsDir);

        for (const file of files) {
            if (file === 'index.ts' || file === 'index.js' || file.endsWith('.d.ts')) continue;
            if (file.endsWith('.ts') || file.endsWith('.js')) {
                console.log(`Processing file: ${file}`);
                try {
                    const pluginModule = require(path.join(pluginsDir, file));
                    
                    // Support modules that export multiple plugins as an array, 
                    // or a single plugin object.
                    const exports = pluginModule.default || pluginModule;
                    
                    if (Array.isArray(exports)) {
                        for (const p of exports) {
                            this.registerPlugin(p, file);
                        }
                    } else if (exports.declaration && exports.execute) {
                        this.registerPlugin(exports, file);
                    } else {
                        console.log(`File ${file} did not export valid plugin structure. Exports:`, Object.keys(exports));
                    }
                } catch (e) {
                    console.error(`Failed to load plugin from ${file}:`, e);
                }
            }
        }
    }

    private registerPlugin(plugin: LegionPlugin, source: string) {
        if (!plugin.declaration?.name) {
            console.warn(`Plugin from ${source} is missing a name.`);
            return;
        }
        this.plugins.set(plugin.declaration.name, plugin);
        console.log(`Loaded plugin: ${plugin.declaration.name}`);
    }

    public getFunctionDeclarations(): PluginDeclaration[] {
        return Array.from(this.plugins.values()).map(p => p.declaration);
    }

    public async executeTool(name: string, args: any): Promise<any> {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new Error(`Unknown function: ${name}`);
        }
        try {
            return await plugin.execute(args);
        } catch (error: any) {
            console.error(`Error executing plugin ${name}:`, error);
            return { error: error.message };
        }
    }
}

export const pluginManager = new PluginManager();
