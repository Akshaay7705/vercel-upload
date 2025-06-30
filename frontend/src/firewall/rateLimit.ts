// rateLimit.ts
interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  allowed: boolean;
}

export class RateLimiter {
  private limits = new Map<string, { limit: number; duration: number; requests: number[]; }>();

  constructor() {
    // Initialize with default values
    this.setRateLimit('default', 5, 1); // 5 requests per minute by default
  }

  public setRateLimit(userId: string, limit: number, duration: number) {
    this.limits.forEach((_, uid) => {
      this.limits.set(uid, {
        limit,
        duration: duration * 60 * 1000, // Convert minutes to milliseconds
        requests: this.limits.get(uid)?.requests || [],
      });
    });
    if (!this.limits.has(userId)) {
      this.limits.set(userId, {
        limit,
        duration: duration * 60 * 1000,
        requests: [],
      });
    }
  }

  public checkRateLimit(userId: string): RateLimitStatus {
    const userLimit = this.limits.get(userId) || this.limits.get('default');
    if (!userLimit) return { remaining: 0, resetTime: Date.now(), allowed: false };

    const now = Date.now();
    userLimit.requests = userLimit.requests.filter(time => now - time < userLimit.duration);
    const remaining = Math.max(0, userLimit.limit - userLimit.requests.length);

    if (remaining === 0) {
      return {
        remaining,
        resetTime: now + userLimit.duration,
        allowed: false,
      };
    }

    userLimit.requests.push(now);
    return {
      remaining,
      resetTime: now + userLimit.duration,
      allowed: true,
    };
  }

  public getRateLimitStatus(userId: string): RateLimitStatus {
    const userLimit = this.limits.get(userId) || this.limits.get('default');
    if (!userLimit) return { remaining: 0, resetTime: Date.now(), allowed: false };

    const now = Date.now();
    userLimit.requests = userLimit.requests.filter(time => now - time < userLimit.duration);
    const remaining = Math.max(0, userLimit.limit - userLimit.requests.length);
    return {
      remaining,
      resetTime: now + userLimit.duration,
      allowed: remaining > 0,
    };
  }

  public resetUser(userId: string) {
    const userLimit = this.limits.get(userId);
    if (userLimit) userLimit.requests = [];
  }

  public resetAll() {
    this.limits.forEach((_, uid) => this.resetUser(uid));
  }
}

export const rateLimiter = new RateLimiter();