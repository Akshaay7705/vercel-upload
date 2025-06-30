// Core Types for Blackbox AI Firewall
export interface DetectionResult {
  isMalicious: boolean;
  confidence: number;
  reasons: string[];
  category: 'jailbreak' | 'injection' | 'system_command' | 'safe';
  timestamp: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  userId: string;
}

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
}

export interface IntentVerification {
  userIntent: string;
  llmOutput: string;
  matches: boolean;
  confidence: number;
  explanation: string;
}

export interface FirewallStats {
  totalRequests: number;
  blockedRequests: number;
  successRate: number;
  avgProcessingTime: number;
  topThreats: Array<{ category: string; count: number }>;
}

export interface UserSession {
  userId: string;
  requestCount: number;
  lastRequest: number;
  blocked: boolean;
}