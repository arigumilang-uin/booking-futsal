/**
 * Simple In-Memory Cache Implementation
 * Untuk caching static data dan frequently accessed data
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Set cache dengan TTL (Time To Live)
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - TTL in seconds (default: 300 = 5 minutes)
   */
  set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    
    this.cache.set(key, value);
    this.ttl.set(key, expiresAt);
    this.stats.sets++;
    
    // Auto cleanup expired entries
    this.cleanup();
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    // Check if key exists and not expired
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return null;
    }

    const expiresAt = this.ttl.get(key);
    if (Date.now() > expiresAt) {
      // Expired, remove from cache
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return this.cache.get(key);
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
    this.stats.deletes++;
  }

  /**
   * Clear all cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.ttl.clear();
    this.stats.deletes += size;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      total_requests: totalRequests,
      hit_rate_percentage: parseFloat(hitRate),
      cache_size: this.cache.size,
      memory_usage_mb: this.getMemoryUsage()
    };
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  getMemoryUsage() {
    let totalSize = 0;
    
    for (const [key, value] of this.cache) {
      totalSize += JSON.stringify(key).length;
      totalSize += JSON.stringify(value).length;
    }
    
    return (totalSize / 1024 / 1024).toFixed(2); // Convert to MB
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, expiresAt] of this.ttl) {
      if (now > expiresAt) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.delete(key));
  }

  /**
   * Get or set pattern - if not in cache, execute function and cache result
   * @param {string} key - Cache key
   * @param {Function} fn - Function to execute if cache miss
   * @param {number} ttlSeconds - TTL in seconds
   */
  async getOrSet(key, fn, ttlSeconds = 300) {
    let value = this.get(key);
    
    if (value === null) {
      value = await fn();
      this.set(key, value, ttlSeconds);
    }
    
    return value;
  }

  /**
   * Check if key exists and not expired
   * @param {string} key - Cache key
   */
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }

    const expiresAt = this.ttl.get(key);
    if (Date.now() > expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get all cache keys
   */
  keys() {
    this.cleanup(); // Clean expired first
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size() {
    this.cleanup(); // Clean expired first
    return this.cache.size;
  }
}

// Create global cache instances
const fieldCache = new SimpleCache();
const userCache = new SimpleCache();
const statisticsCache = new SimpleCache();
const systemCache = new SimpleCache();

// Cache key generators
const generateCacheKey = {
  field: (id) => `field:${id}`,
  allFields: () => 'fields:all',
  availableFields: () => 'fields:available',
  user: (id) => `user:${id}`,
  userProfile: (id) => `user:profile:${id}`,
  usersByRole: (role) => `users:role:${role}`,
  bookingStats: (startDate, endDate) => `stats:bookings:${startDate}:${endDate}`,
  revenueStats: (startDate, endDate) => `stats:revenue:${startDate}:${endDate}`,
  dashboardStats: (userId, role) => `stats:dashboard:${role}:${userId}`,
  systemSettings: (key) => `system:settings:${key}`,
  systemHealth: () => 'system:health'
};

// Cache TTL configurations (in seconds)
const cacheTTL = {
  fields: 600,        // 10 minutes - fields don't change often
  users: 300,         // 5 minutes - user data can change
  statistics: 180,    // 3 minutes - stats need to be relatively fresh
  systemSettings: 900, // 15 minutes - system settings rarely change
  systemHealth: 60    // 1 minute - health data should be fresh
};

// Cache invalidation helpers
const invalidateCache = {
  field: (id) => {
    fieldCache.delete(generateCacheKey.field(id));
    fieldCache.delete(generateCacheKey.allFields());
    fieldCache.delete(generateCacheKey.availableFields());
  },
  
  user: (id) => {
    userCache.delete(generateCacheKey.user(id));
    userCache.delete(generateCacheKey.userProfile(id));
    // Also invalidate role-based caches (we don't know the user's role)
    userCache.keys().forEach(key => {
      if (key.startsWith('users:role:')) {
        userCache.delete(key);
      }
    });
  },
  
  statistics: () => {
    statisticsCache.clear(); // Clear all statistics cache
  },
  
  systemSettings: (key) => {
    if (key) {
      systemCache.delete(generateCacheKey.systemSettings(key));
    } else {
      systemCache.clear(); // Clear all system cache
    }
  }
};

// Performance monitoring for cache
const monitorCachePerformance = () => {
  const stats = {
    field_cache: fieldCache.getStats(),
    user_cache: userCache.getStats(),
    statistics_cache: statisticsCache.getStats(),
    system_cache: systemCache.getStats()
  };
  
  const totalHits = Object.values(stats).reduce((sum, cache) => sum + cache.hits, 0);
  const totalMisses = Object.values(stats).reduce((sum, cache) => sum + cache.misses, 0);
  const totalRequests = totalHits + totalMisses;
  const overallHitRate = totalRequests > 0 ? (totalHits / totalRequests * 100).toFixed(2) : 0;
  
  return {
    ...stats,
    overall: {
      total_hits: totalHits,
      total_misses: totalMisses,
      total_requests: totalRequests,
      overall_hit_rate_percentage: parseFloat(overallHitRate)
    }
  };
};

module.exports = {
  fieldCache,
  userCache,
  statisticsCache,
  systemCache,
  generateCacheKey,
  cacheTTL,
  invalidateCache,
  monitorCachePerformance
};
