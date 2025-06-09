/**
 * Cache Controller untuk monitoring dan management cache
 */

const { monitorCachePerformance, fieldCache, userCache, statisticsCache, systemCache } = require('../../utils/cache');
const { asyncHandler, createSuccessResponse } = require('../../middlewares/errorHandler');

// Get cache statistics
const getCacheStats = asyncHandler(async (req, res) => {
  const stats = monitorCachePerformance();
  
  res.json(createSuccessResponse(stats, 'Cache statistics retrieved successfully'));
});

// Clear specific cache
const clearCache = asyncHandler(async (req, res) => {
  const { type } = req.params;
  
  let cleared = false;
  let message = '';
  
  switch (type) {
    case 'field':
      fieldCache.clear();
      cleared = true;
      message = 'Field cache cleared successfully';
      break;
    case 'user':
      userCache.clear();
      cleared = true;
      message = 'User cache cleared successfully';
      break;
    case 'statistics':
      statisticsCache.clear();
      cleared = true;
      message = 'Statistics cache cleared successfully';
      break;
    case 'system':
      systemCache.clear();
      cleared = true;
      message = 'System cache cleared successfully';
      break;
    case 'all':
      fieldCache.clear();
      userCache.clear();
      statisticsCache.clear();
      systemCache.clear();
      cleared = true;
      message = 'All caches cleared successfully';
      break;
    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid cache type. Valid types: field, user, statistics, system, all'
      });
  }
  
  res.json(createSuccessResponse({ cleared }, message));
});

// Get cache keys
const getCacheKeys = asyncHandler(async (req, res) => {
  const { type } = req.params;
  
  let keys = [];
  let cacheType = '';
  
  switch (type) {
    case 'field':
      keys = fieldCache.keys();
      cacheType = 'Field';
      break;
    case 'user':
      keys = userCache.keys();
      cacheType = 'User';
      break;
    case 'statistics':
      keys = statisticsCache.keys();
      cacheType = 'Statistics';
      break;
    case 'system':
      keys = systemCache.keys();
      cacheType = 'System';
      break;
    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid cache type. Valid types: field, user, statistics, system'
      });
  }
  
  res.json(createSuccessResponse({
    cache_type: cacheType,
    total_keys: keys.length,
    keys: keys
  }, `${cacheType} cache keys retrieved successfully`));
});

// Get cache health
const getCacheHealth = asyncHandler(async (req, res) => {
  const stats = monitorCachePerformance();
  
  // Determine cache health based on hit rates
  const overallHitRate = stats.overall.overall_hit_rate_percentage;
  let health = 'poor';
  let recommendations = [];
  
  if (overallHitRate >= 80) {
    health = 'excellent';
    recommendations.push('Cache performance is excellent');
  } else if (overallHitRate >= 60) {
    health = 'good';
    recommendations.push('Cache performance is good, consider optimizing cache TTL');
  } else if (overallHitRate >= 40) {
    health = 'fair';
    recommendations.push('Cache hit rate is below optimal, review caching strategy');
    recommendations.push('Consider increasing cache TTL for stable data');
  } else {
    health = 'poor';
    recommendations.push('Cache hit rate is very low, review implementation');
    recommendations.push('Check if cache invalidation is too aggressive');
    recommendations.push('Consider warming up cache for frequently accessed data');
  }
  
  // Check memory usage
  const totalMemoryMB = Object.values(stats)
    .filter(cache => cache.memory_usage_mb)
    .reduce((sum, cache) => sum + parseFloat(cache.memory_usage_mb), 0);
  
  if (totalMemoryMB > 100) {
    recommendations.push('High memory usage detected, consider cache cleanup');
  }
  
  res.json(createSuccessResponse({
    health_status: health,
    overall_hit_rate: overallHitRate,
    total_memory_usage_mb: totalMemoryMB.toFixed(2),
    recommendations,
    detailed_stats: stats
  }, 'Cache health assessment completed'));
});

// Warm up cache (preload frequently accessed data)
const warmUpCache = asyncHandler(async (req, res) => {
  const { getAvailableFields, getAllFields } = require('../../models/business/fieldModel');
  const { getUsersByRole } = require('../../models/core/userModel');
  
  let warmedUp = [];
  
  try {
    // Warm up field cache
    await getAvailableFields();
    warmedUp.push('Available fields');
    
    await getAllFields(1, 10);
    warmedUp.push('All fields (page 1)');
    
    // Warm up user cache for common roles
    const commonRoles = ['user', 'pengelola', 'admin'];
    for (const role of commonRoles) {
      await getUsersByRole(role);
      warmedUp.push(`Users with role: ${role}`);
    }
    
    res.json(createSuccessResponse({
      warmed_up: warmedUp,
      total_items: warmedUp.length
    }, 'Cache warm-up completed successfully'));
    
  } catch (error) {
    res.json(createSuccessResponse({
      warmed_up: warmedUp,
      total_items: warmedUp.length,
      error: error.message
    }, 'Cache warm-up completed with some errors'));
  }
});

module.exports = {
  getCacheStats,
  clearCache,
  getCacheKeys,
  getCacheHealth,
  warmUpCache
};
