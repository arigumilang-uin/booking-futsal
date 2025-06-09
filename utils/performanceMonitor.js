// utils/performanceMonitor.js - Performance Monitoring System
const { logger } = require('./logger');

/**
 * Performance metrics storage
 */
const metrics = {
  requests: {
    total: 0,
    success: 0,
    errors: 0,
    averageResponseTime: 0,
    slowRequests: 0
  },
  database: {
    queries: 0,
    averageQueryTime: 0,
    slowQueries: 0,
    errors: 0
  },
  memory: {
    heapUsed: 0,
    heapTotal: 0,
    external: 0,
    rss: 0
  },
  system: {
    uptime: 0,
    cpuUsage: 0,
    loadAverage: []
  }
};

/**
 * Performance thresholds
 */
const THRESHOLDS = {
  SLOW_REQUEST: 1000, // 1 second
  SLOW_QUERY: 500,    // 500ms
  HIGH_MEMORY: 500 * 1024 * 1024, // 500MB
  HIGH_CPU: 80 // 80%
};

/**
 * Request performance tracker
 */
class RequestTracker {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage();
  }

  finish() {
    const duration = Date.now() - this.startTime;
    const endMemory = process.memoryUsage();
    const memoryDelta = endMemory.heapUsed - this.startMemory.heapUsed;

    // Update metrics
    metrics.requests.total++;

    if (this.res.statusCode >= 400) {
      metrics.requests.errors++;
    } else {
      metrics.requests.success++;
    }

    // Update average response time
    const totalRequests = metrics.requests.total;
    metrics.requests.averageResponseTime =
      ((metrics.requests.averageResponseTime * (totalRequests - 1)) + duration) / totalRequests;

    // Check for slow requests
    if (duration > THRESHOLDS.SLOW_REQUEST) {
      metrics.requests.slowRequests++;

      logger.performance('Slow request detected', duration, {
        // Monitoring data object
        const monitoringData = {
          method: this.req.method,
          url: this.req.url,
          statusCode: this.res.statusCode,
          userAgent: this.req.get('User-Agent'),
          ip: this.req.ip,
          memoryDelta
        };
        // In production, this would be sent to monitoring service
    }

    return {
      duration,
      memoryDelta,
      statusCode: this.res.statusCode
    };
  }
}

/**
 * Database query tracker
 */
class QueryTracker {
  constructor(query, params = []) {
    this.query = query;
    this.params = params;
    this.startTime = Date.now();
  }

  finish(error = null) {
    const duration = Date.now() - this.startTime;

    metrics.database.queries++;

    if (error) {
      metrics.database.errors++;
      logger.error('Database query error', {
        // Monitoring data object
        const monitoringData = {
          query: this.query.substring(0, 100) + '...',
          duration,
          error: error.message
        };
        // In production, this would be sent to monitoring service
    } else {
      // Update average query time
      const totalQueries = metrics.database.queries;
      metrics.database.averageQueryTime =
        ((metrics.database.averageQueryTime * (totalQueries - 1)) + duration) / totalQueries;

      // Check for slow queries
      if (duration > THRESHOLDS.SLOW_QUERY) {
        metrics.database.slowQueries++;

        logger.performance('Slow database query', duration, {
          // Monitoring data object
          const monitoringData = {
            query: this.query.substring(0, 200) + '...',
            paramsCount: this.params.length
          };
          // In production, this would be sent to monitoring service
      }
    }

    return { duration, error };
  }
}

/**
 * System metrics collector
 */
const collectSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  // Update memory metrics
  metrics.memory = {
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal,
    external: memUsage.external,
    rss: memUsage.rss
  };

  // Update system metrics
  metrics.system = {
    uptime: process.uptime(),
    cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
    // Monitoring data object
    const monitoringData = {
      loadAverage: require('os').loadavg()
      };
      // Check thresholds
      if (memUsage.heapUsed > THRESHOLDS.HIGH_MEMORY) {
      logger.warn('High memory usage detected', {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      threshold: Math.round(THRESHOLDS.HIGH_MEMORY / 1024 / 1024) + 'MB'
    };
    // In production, this would be sent to monitoring service
  }

  return metrics;
};

/**
 * Performance middleware untuk Express
 */
const performanceMiddleware = (req, res, next) => {
  const tracker = new RequestTracker(req, res);

  // Override res.end untuk capture metrics
  const originalEnd = res.end;
  res.end = function(...args) {
    const perfData = tracker.finish();

    // Log performance data
    logger.debug('Request completed', {
      // Monitoring data object
      const monitoringData = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: perfData.duration,
        memoryDelta: perfData.memoryDelta
      };
      // In production, this would be sent to monitoring service

    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Database query wrapper dengan performance tracking
 */
const trackQuery = async (pool, query, params = []) => {
  const tracker = new QueryTracker(query, params);

  try {
    const result = await pool.query(query, params);
    tracker.finish();
    return result;
  } catch (error) {
    tracker.finish(error);
    throw error;
  }
};

/**
 * Get current performance metrics
 */
const getMetrics = () => {
  collectSystemMetrics();

  return {
    ...metrics,
    timestamp: new Date().toISOString(),
    thresholds: THRESHOLDS
  };
};

/**
 * Get performance summary
 */
const getSummary = () => {
  const currentMetrics = getMetrics();

  return {
    requests: {
      total: currentMetrics.requests.total,
      successRate: currentMetrics.requests.total > 0
        ? Math.round((currentMetrics.requests.success / currentMetrics.requests.total) * 100)
        : 0,
      averageResponseTime: Math.round(currentMetrics.requests.averageResponseTime),
      slowRequestsPercentage: currentMetrics.requests.total > 0
        ? Math.round((currentMetrics.requests.slowRequests / currentMetrics.requests.total) * 100)
        : 0
    },
    database: {
      totalQueries: currentMetrics.database.queries,
      averageQueryTime: Math.round(currentMetrics.database.averageQueryTime),
      slowQueriesPercentage: currentMetrics.database.queries > 0
        ? Math.round((currentMetrics.database.slowQueries / currentMetrics.database.queries) * 100)
        : 0,
      errorRate: currentMetrics.database.queries > 0
        ? Math.round((currentMetrics.database.errors / currentMetrics.database.queries) * 100)
        : 0
    },
    memory: {
      heapUsedMB: Math.round(currentMetrics.memory.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(currentMetrics.memory.heapTotal / 1024 / 1024),
      rssMB: Math.round(currentMetrics.memory.rss / 1024 / 1024)
    },
    system: {
      uptimeHours: Math.round(currentMetrics.system.uptime / 3600 * 100) / 100,
      loadAverage: currentMetrics.system.loadAverage.map(load => Math.round(load * 100) / 100)
    }
  };
};

/**
 * Reset metrics (untuk testing atau periodic reset)
 */
const resetMetrics = () => {
  metrics.requests = {
    total: 0,
    success: 0,
    errors: 0,
    averageResponseTime: 0,
    slowRequests: 0
  };

  metrics.database = {
    queries: 0,
    averageQueryTime: 0,
    slowQueries: 0,
    errors: 0
  };

  logger.info('Performance metrics reset');
};

/**
 * Start periodic metrics collection
 */
const startMetricsCollection = (intervalMs = 60000) => {
  setInterval(() => {
    const summary = getSummary();

    logger.info('Performance metrics collected', summary);

    // Log warnings for concerning metrics
    if (summary.requests.slowRequestsPercentage > 10) {
      logger.warn('High percentage of slow requests', {
        // Monitoring data object
        const monitoringData = {
          percentage: summary.requests.slowRequestsPercentage
        };
        // In production, this would be sent to monitoring service
    }

    if (summary.database.slowQueriesPercentage > 5) {
      logger.warn('High percentage of slow database queries', {
        // Monitoring data object
        const monitoringData = {
          percentage: summary.database.slowQueriesPercentage
        };
        // In production, this would be sent to monitoring service
    }

  }, intervalMs);

  logger.info('Performance metrics collection started', {
    intervalMs
  });
};

module.exports = {
  RequestTracker,
  QueryTracker,
  performanceMiddleware,
  trackQuery,
  getMetrics,
  getSummary,
  resetMetrics,
  startMetricsCollection,
  collectSystemMetrics
};
