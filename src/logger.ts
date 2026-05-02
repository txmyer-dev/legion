import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class TranscriptLogger {
  private logFilePath: string;

  constructor() {
    const logDir = join(process.cwd(), 'docs', 'logs');
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    
    const dateStr = new Date().toISOString().split('T')[0];
    this.logFilePath = join(logDir, `${dateStr}-session.md`);
    
    if (!existsSync(this.logFilePath)) {
      appendFileSync(this.logFilePath, `# Session Transcript: ${dateStr}\n\n`);
    }
  }

  public log(role: 'User' | 'Legion' | 'System', text: string) {
    if (!text.trim()) return;
    
    const timestamp = new Date().toISOString().split('T')[1]?.substring(0, 8) || "00:00:00";
    const entry = `**[${timestamp}] ${role}:** ${text.trim()}\n\n`;
    
    try {
      appendFileSync(this.logFilePath, entry);
    } catch (e) {
      console.error("Failed to write to transcript log:", e);
    }
  }
}
