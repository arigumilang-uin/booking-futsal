// routes/testRoutes.js - Minimal Routes for Testing
const express = require('express');
const router = express.Router();
const { getTimezoneDebugInfo, getSafeTimezoneConfig, formatTimeForLogging } = require('../utils/timezoneUtils');

// =====================================================
// MINIMAL TEST ROUTES
// =====================================================

/**
 * @route   GET /api/test/health
 * @desc    Enhanced health check for production monitoring
 * @access  Public
 */
router.get('/health', async (req, res) => {
  const startTime = Date.now();

  try {
    // Database health check
    const pool = require('../config/db');
    const dbResult = await pool.query('SELECT NOW() as current_time');
    const dbLatency = Date.now() - startTime;

    // Memory usage
    const memUsage = process.memoryUsage();

    // System health
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`,
        current_time: dbResult.rows[0].current_time
      },
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
      },
      performance: {
        response_time: `${Date.now() - startTime}ms`,
        cpu_usage: process.cpuUsage()
      }
    };

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

/**
 * @route   GET /api/test/routes
 * @desc    List all available routes
 * @access  Public
 */
router.get('/routes', (req, res) => {
  res.json({
    success: true,
    data: {
      available_routes: [
        'GET /api/test/health',
        'GET /api/test/routes',
        'GET /api/test/database',
        'GET /api/test/auth',
        'GET /api/test/public',
        'GET /api/test/customer',
        'GET /api/test/admin',
        'GET /api/test/staff'
      ],
      route_structure: 'Simplified flat structure',
      total_route_files: 10
    }
  });
});

/**
 * @route   GET /api/test/database
 * @desc    Test database connection
 * @access  Public
 */
router.get('/database', async (req, res) => {
  try {
    const pool = require('../config/db');
    const result = await pool.query('SELECT NOW() as current_time');
    
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        current_time: result.rows[0].current_time,
        connection_status: 'connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/test/auth
 * @desc    Test auth routes
 * @access  Public
 */
router.get('/auth', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes working',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/auth/profile',
      'POST /api/auth/refresh'
    ]
  });
});

/**
 * @route   GET /api/test/public
 * @desc    Test public routes
 * @access  Public
 */
router.get('/public', (req, res) => {
  res.json({
    success: true,
    message: 'Public routes working',
    endpoints: [
      'GET /api/public/fields',
      'GET /api/public/health',
      'GET /api/public/version'
    ]
  });
});

/**
 * @route   GET /api/test/customer
 * @desc    Test customer routes
 * @access  Public
 */
router.get('/customer', (req, res) => {
  res.json({
    success: true,
    message: 'Customer routes working',
    endpoints: [
      'GET /api/customer/bookings',
      'POST /api/customer/bookings',
      'GET /api/customer/profile'
    ]
  });
});

/**
 * @route   GET /api/test/admin
 * @desc    Test admin routes
 * @access  Public
 */
router.get('/admin', (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes working',
    endpoints: [
      'GET /api/admin/users',
      'GET /api/admin/settings',
      'GET /api/admin/analytics'
    ]
  });
});

/**
 * @route   GET /api/test/staff
 * @desc    Test staff routes
 * @access  Public
 */
router.get('/staff', (req, res) => {
  res.json({
    success: true,
    message: 'Staff routes working',
    endpoints: [
      'GET /api/staff/kasir/*',
      'GET /api/staff/operator/*',
      'GET /api/staff/manager/*',
      'GET /api/staff/supervisor/*'
    ]
  });
});

/**
 * @route   GET /api/test/environment
 * @desc    Test environment configuration
 * @access  Public
 */
router.get('/environment', (req, res) => {
  res.json({
    success: true,
    data: {
      node_env: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000,
      database_configured: !!process.env.DATABASE_URL,
      jwt_configured: !!process.env.JWT_SECRET,
      cors_origin: process.env.CORS_ORIGIN || 'localhost'
    }
  });
});

/**
 * @route   GET /api/test/memory
 * @desc    Test memory usage
 * @access  Public
 */
router.get('/memory', (req, res) => {
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    data: {
      memory_usage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heap_total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heap_used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
      },
      uptime: `${Math.round(process.uptime())} seconds`,
      pid: process.pid
    }
  });
});

/**
 * @route   GET /api/test/timezone
 * @desc    Test timezone configuration and cron job compatibility
 * @access  Public
 */
router.get('/timezone', (req, res) => {
  try {
    const debugInfo = getTimezoneDebugInfo();
    const config = getSafeTimezoneConfig();

    res.json({
      success: true,
      message: 'Timezone configuration test',
      data: {
        current_config: config,
        debug_info: debugInfo,
        formatted_time: formatTimeForLogging(new Date(), { includeTimezone: true }),
        cron_compatibility: {
          timezone: config.timezone,
          is_safe_for_production: config.isProduction ? config.timezone === 'UTC' : true,
          recommendation: config.isProduction
            ? 'Using UTC timezone for production safety'
            : 'Development environment - any timezone acceptable'
        },
        test_timestamps: {
          utc_now: new Date().toISOString(),
          local_now: new Date().toString(),
          timestamp: Date.now(),
          timezone_offset_minutes: new Date().getTimezoneOffset()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Timezone test failed',
      error: error.message
    });
  }
});

module.exports = router;
