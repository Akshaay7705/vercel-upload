// /src/firewall/log.ts (unchanged from previous)
import { quantumEncryptor } from '../utils/quantumEncrypt';

export interface LogEntry {
  id: string;
  timestamp: Date;
  input: string;
  output?: string;
  blocked: boolean;
  reason?: string;
  userId: string;
  confidence: number;
  category: string;
  processingTime: number;
  encryptedData: string;
}

export interface Stats {
  totalRequests: number;
  blockedRequests: number;
  successRate: number;
  avgProcessingTime: number;
}

interface HourlyData {
  hour: string;
  requests: number;
  blocked: number;
}

class FirewallLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionKey: number[] | null = null;
  private initialized = false;

  public async initialize(): Promise<void> {
    if (!this.sessionKey) {
      try {
        this.sessionKey = await quantumEncryptor.getSessionKey();
        console.log('Session key initialized successfully');
        this.initialized = true;
      } catch (err) {
        console.error('Failed to initialize session key:', err);
        this.sessionKey = Array(16).fill(0); // Fallback key
        this.initialized = true;
      }
    }
  }

  public async log(entry: Omit<LogEntry, 'id' | 'timestamp' | 'encryptedData'>): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      encryptedData: quantumEncryptor.encrypt(JSON.stringify(entry), this.sessionKey!),
      ...entry,
    };
    this.logs.push(newEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    console.log(`[${newEntry.timestamp.toLocaleTimeString()}] ${newEntry.blocked ? 'BLOCKED' : 'ALLOWED'}: ${newEntry.input} - ${newEntry.reason || 'Processed'} (Confidence: ${newEntry.confidence.toFixed(2)}, Time: ${newEntry.processingTime}ms)`);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs].slice(-50).reverse();
  }

  public getStats(): Stats {
    if (!this.initialized) {
      console.warn('Stats requested before initialization, returning fallback.');
      return {
        totalRequests: 0,
        blockedRequests: 0,
        successRate: 0,
        avgProcessingTime: 0,
      };
    }
    const totalRequests = this.logs.length;
    const blockedRequests = this.logs.filter(log => {
      const decrypted = JSON.parse(quantumEncryptor.decrypt(log.encryptedData, this.sessionKey!));
      return decrypted.blocked;
    }).length;
    const successRate = totalRequests > 0 ? ((totalRequests - blockedRequests) / totalRequests) * 100 : 0;
    const avgProcessingTime = totalRequests > 0 ? this.logs.reduce((sum, log) => {
      const decrypted = JSON.parse(quantumEncryptor.decrypt(log.encryptedData, this.sessionKey!));
      return sum + decrypted.processingTime;
    }, 0) / totalRequests : 0;

    return {
      totalRequests,
      blockedRequests,
      successRate: Math.round(successRate * 100) / 100,
      avgProcessingTime: Math.round(avgProcessingTime * 100) / 100,
    };
  }

  public getHourlyData(hours: number): HourlyData[] {
    if (!this.initialized) {
      console.warn('Hourly data requested before initialization, returning empty array.');
      return [];
    }
    const data: HourlyData[] = [];
    const now = new Date();

    for (let i = hours - 1; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStart = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours());
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const hourLogs = this.logs.filter(log => log.timestamp >= hourStart && log.timestamp < hourEnd);
      const requests = hourLogs.length;
      const blocked = hourLogs.filter(log => {
        const decrypted = JSON.parse(quantumEncryptor.decrypt(log.encryptedData, this.sessionKey!));
        return decrypted.blocked;
      }).length;

      data.push({
        hour: hourStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        requests,
        blocked,
      });
    }

    return data;
  }
}

export const logger = new FirewallLogger();