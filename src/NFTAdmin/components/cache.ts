// A simple cache implementation for the NFT widget
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTtl: number;

  constructor(defaultTtlMs: number = 5 * 60 * 1000) { // Default 5 minutes
    this.defaultTtl = defaultTtlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.defaultTtl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
