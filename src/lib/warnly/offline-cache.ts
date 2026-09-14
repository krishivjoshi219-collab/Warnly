/**
 * Warnly High-Performance Persistent Offline Cache
 * Uses expo-file-system for disk persistence combined with zero-latency in-memory caching.
 * Guarantees that Warnly remains 100% operational during Himalayan grid/telecom outages.
 */
import * as FileSystem from 'expo-file-system';

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class OfflineStorageEngine {
  private memCache: Map<string, CacheEnvelope<unknown>> = new Map();
  private cacheDir: string = '';
  private initialized: boolean = false;
  private diskAvailable: boolean = false;

  private async ensureDir() {
    if (this.initialized) return;
    try {
      const docDir = (FileSystem as { documentDirectory?: string | null }).documentDirectory;
      if (!docDir) {
        // Expo web / runtimes without a document directory: memory-only cache.
        this.diskAvailable = false;
        this.initialized = true;
        return;
      }
      this.cacheDir = `${docDir}warnly_cache/`;
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }
      this.diskAvailable = true;
      this.initialized = true;
    } catch {
      // Fallback to memory-only if filesystem fails
      this.diskAvailable = false;
      this.initialized = true;
    }
  }

  private sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json';
  }

  /**
   * Put an object into cache with TTL
   */
  async set<T>(key: string, data: T, ttlMs: number = 1000 * 60 * 60 * 24): Promise<void> {
    const envelope: CacheEnvelope<T> = {
      data,
      timestamp: Date.now(),
      ttlMs,
    };
    this.memCache.set(key, envelope);

    try {
      await this.ensureDir();
      if (!this.diskAvailable) return;
      const filePath = `${this.cacheDir}${this.sanitizeKey(key)}`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(envelope));
    } catch {
      // Memory cache is maintained regardless
    }
  }

  /**
   * Get an object from cache. If expired or missing, returns null.
   * If allowStale is true, returns cached data even if past TTL (critical for emergency situations).
   */
  async get<T>(key: string, allowStale: boolean = true): Promise<T | null> {
    // 1. Check in-memory first
    const inMem = this.memCache.get(key);
    if (inMem) {
      const isExpired = Date.now() - inMem.timestamp > inMem.ttlMs;
      if (!isExpired || allowStale) {
        return inMem.data as T;
      }
    }

    // 2. Fall back to disk (skipped when no document directory exists)
    try {
      await this.ensureDir();
      if (!this.diskAvailable) return null;
      const filePath = `${this.cacheDir}${this.sanitizeKey(key)}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        const raw = await FileSystem.readAsStringAsync(filePath);
        const parsed = JSON.parse(raw) as CacheEnvelope<T>;
        this.memCache.set(key, parsed);

        const isExpired = Date.now() - parsed.timestamp > parsed.ttlMs;
        if (!isExpired || allowStale) {
          return parsed.data;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  /**
   * Retrieves last updated timestamp for a cache entry
   */
  async getAgeMs(key: string): Promise<number | null> {
    const inMem = this.memCache.get(key);
    if (inMem) {
      return Date.now() - inMem.timestamp;
    }
    return null;
  }
}

export const offlineCache = new OfflineStorageEngine();
