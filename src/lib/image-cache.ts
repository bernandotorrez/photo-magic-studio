/**
 * Image URL Cache Utility
 * 
 * Caches signed URLs for images to reduce API calls and improve performance.
 * Uses localStorage with expiration tracking.
 */

interface CachedUrl {
  url: string;
  expiresAt: number; // timestamp
  cachedAt: number;  // timestamp
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

const CACHE_PREFIX = 'img_cache_';
const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes (URLs expire in 1 hour, cache for 50 min to be safe)
const MAX_CACHE_SIZE = 100; // Maximum number of cached URLs

class ImageCache {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
  };

  /**
   * Get cached URL for an image path
   */
  get(imagePath: string): string | null {
    try {
      const cacheKey = this.getCacheKey(imagePath);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        this.stats.misses++;
        return null;
      }

      const data: CachedUrl = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now > data.expiresAt) {
        this.remove(imagePath);
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return data.url;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Set cached URL for an image path
   */
  set(imagePath: string, url: string, expiresInMs: number = CACHE_DURATION): void {
    try {
      // Check cache size and cleanup if needed
      if (this.getSize() >= MAX_CACHE_SIZE) {
        this.cleanup();
      }

      const cacheKey = this.getCacheKey(imagePath);
      const now = Date.now();
      
      const data: CachedUrl = {
        url,
        expiresAt: now + expiresInMs,
        cachedAt: now,
      };

      localStorage.setItem(cacheKey, JSON.stringify(data));
      this.stats.size = this.getSize();
    } catch (error) {
      console.error('Error writing to cache:', error);
      // If localStorage is full, try to cleanup and retry
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanup(true);
        try {
          const cacheKey = this.getCacheKey(imagePath);
          const now = Date.now();
          const data: CachedUrl = {
            url,
            expiresAt: now + expiresInMs,
            cachedAt: now,
          };
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (retryError) {
          console.error('Failed to cache after cleanup:', retryError);
        }
      }
    }
  }

  /**
   * Remove cached URL for an image path
   */
  remove(imagePath: string): void {
    try {
      const cacheKey = this.getCacheKey(imagePath);
      localStorage.removeItem(cacheKey);
      this.stats.size = this.getSize();
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  /**
   * Clear all cached URLs
   */
  clear(): void {
    try {
      const keys = this.getAllCacheKeys();
      keys.forEach(key => localStorage.removeItem(key));
      this.stats = { hits: 0, misses: 0, size: 0 };
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Cleanup expired entries
   * @param aggressive If true, remove oldest 50% of entries regardless of expiration
   */
  cleanup(aggressive: boolean = false): void {
    try {
      const keys = this.getAllCacheKeys();
      const now = Date.now();
      let removed = 0;

      if (aggressive) {
        // Remove oldest 50% of entries
        const entries = keys.map(key => {
          const data = localStorage.getItem(key);
          if (!data) return null;
          try {
            const parsed: CachedUrl = JSON.parse(data);
            return { key, cachedAt: parsed.cachedAt };
          } catch {
            return null;
          }
        }).filter(Boolean) as { key: string; cachedAt: number }[];

        entries.sort((a, b) => a.cachedAt - b.cachedAt);
        const toRemove = Math.ceil(entries.length / 2);
        
        for (let i = 0; i < toRemove; i++) {
          localStorage.removeItem(entries[i].key);
          removed++;
        }
      } else {
        // Remove only expired entries
        keys.forEach(key => {
          const cached = localStorage.getItem(key);
          if (!cached) return;

          try {
            const data: CachedUrl = JSON.parse(cached);
            if (now > data.expiresAt) {
              localStorage.removeItem(key);
              removed++;
            }
          } catch {
            // Invalid data, remove it
            localStorage.removeItem(key);
            removed++;
          }
        });
      }

      this.stats.size = this.getSize();
      console.log(`Cache cleanup: removed ${removed} entries, ${this.stats.size} remaining`);
    } catch (error) {
      console.error('Error during cache cleanup:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      size: this.getSize(),
    };
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total === 0 ? 0 : this.stats.hits / total;
  }

  /**
   * Private: Get cache key for image path
   */
  private getCacheKey(imagePath: string): string {
    return `${CACHE_PREFIX}${imagePath}`;
  }

  /**
   * Private: Get all cache keys
   */
  private getAllCacheKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Private: Get current cache size
   */
  private getSize(): number {
    return this.getAllCacheKeys().length;
  }
}

// Export singleton instance
export const imageCache = new ImageCache();

// Export utility functions
export const getCachedImageUrl = (imagePath: string) => imageCache.get(imagePath);
export const setCachedImageUrl = (imagePath: string, url: string, expiresInMs?: number) => 
  imageCache.set(imagePath, url, expiresInMs);
export const removeCachedImageUrl = (imagePath: string) => imageCache.remove(imagePath);
export const clearImageCache = () => imageCache.clear();
export const cleanupImageCache = (aggressive?: boolean) => imageCache.cleanup(aggressive);
export const getImageCacheStats = () => imageCache.getStats();
