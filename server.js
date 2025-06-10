const dotenv = require('dotenv');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

// Validasi environment variables sebelum memulai aplikasi
const { validateEnvironment, displayConfig } = require('./config/envValidator');
const envConfig = validateEnvironment();
displayConfig(envConfig);

const app = require('./app');
const cron = require('node-cron');
const { updateCompletedBookings } = require('./utils/updateCompletedBookings');
const { logger } = require('./utils/logger');
const { startMetricsCollection } = require('./utils/performanceMonitor');
const { getSafeTimezoneConfig, formatTimeForLogging, getTimezoneDebugInfo } = require('./utils/timezoneUtils');

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    pid: process.pid,
    timestamp: new Date().toISOString()
  });

  // Determine base URL based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction
    ? 'https://booking-futsal-production.up.railway.app'
    : `http://localhost:${PORT}`;

  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - Health Check: ${baseUrl}/health`);
  console.log(`   - Enhanced Health: ${baseUrl}/health`);
  console.log(`   - API Documentation: ${baseUrl}/api-docs`);
  console.log(`   - Database Test: ${baseUrl}/api/test/database`);
  console.log(`   - System Info: ${baseUrl}/api/public/system-info`);
  console.log(`   - Database Status: ${baseUrl}/api/public/database-status`);

  // Start performance monitoring
  startMetricsCollection(60000); // Collect metrics every minute
});

// Auto-completion cron job - runs every 5 minutes for better responsiveness
const cronSchedule = process.env.AUTO_COMPLETION_SCHEDULE || '*/5 * * * *';
const enableAutoCron = process.env.ENABLE_AUTO_COMPLETION !== 'false';

// Get safe timezone configuration using utility
const timezoneConfig = getSafeTimezoneConfig();

// Log timezone debug info for troubleshooting
if (process.env.NODE_ENV === 'production') {
  const debugInfo = getTimezoneDebugInfo();
  logger.info('Timezone configuration for production', debugInfo);
}

if (enableAutoCron) {
  logger.info('Auto-completion cron job scheduled', {
    schedule: cronSchedule,
    timezone: timezoneConfig.timezone,
    displayTimezone: timezoneConfig.displayTimezone,
    offset: timezoneConfig.offset,
    environment: process.env.NODE_ENV || 'development',
    isProduction: timezoneConfig.isProduction
  });
  console.log(`🕒 Auto-completion cron job scheduled: ${cronSchedule} (${timezoneConfig.timezone})`);

  if (timezoneConfig.isProduction) {
    console.log(`📍 Display timezone: ${timezoneConfig.displayTimezone} (${timezoneConfig.offset})`);
  }

  try {
    cron.schedule(cronSchedule, async () => {
      const startTime = Date.now();
      try {
        logger.info('Starting auto-completion check', {
          timestamp: formatTimeForLogging(new Date(), { includeTimezone: true }),
          timezone: timezoneConfig.timezone,
          displayTimezone: timezoneConfig.displayTimezone
        });

        const updated = await updateCompletedBookings();
        const duration = Date.now() - startTime;

        if (updated.length > 0) {
          logger.business('Auto-completion completed', {
            bookingsCompleted: updated.length,
            duration,
            bookingIds: updated.map(b => b.id),
            timestamp: new Date().toISOString()
          });
          console.log(`[CRON] ✅ ${updated.length} booking(s) auto-completed successfully`);
        } else {
          logger.info('Auto-completion check completed - no bookings to complete', {
            duration,
            timestamp: new Date().toISOString()
          });
          console.log('[CRON] ℹ️ No bookings to complete at this time');
        }
      } catch (err) {
        const duration = Date.now() - startTime;
        logger.error('Auto-completion error', {
          error: err.message,
          stack: err.stack,
          duration,
          timestamp: new Date().toISOString()
        });
        console.error('[CRON] ❌ Auto-completion error:', err);
      }
    }, {
      scheduled: true,
      timezone: timezoneConfig.timezone
    });

    logger.info('Cron job initialized successfully', {
      schedule: cronSchedule,
      timezone: timezoneConfig.timezone
    });

  } catch (cronError) {
    logger.error('Failed to initialize cron job', {
      error: cronError.message,
      stack: cronError.stack,
      schedule: cronSchedule,
      timezone: timezoneConfig.timezone
    });
    console.error('❌ Failed to initialize cron job:', cronError.message);

    // Fallback: disable auto-completion if cron fails
    logger.warn('Auto-completion disabled due to cron initialization failure');
    console.log('⚠️ Auto-completion disabled due to cron initialization failure');
  }
} else {
  logger.warn('Auto-completion cron job disabled via environment variable');
  console.log('⏸️ Auto-completion cron job disabled via environment variable');
}

// =====================================================
// GRACEFUL SHUTDOWN HANDLING
// =====================================================

/**
 * Graceful shutdown handler
 * @param {string} signal - Signal yang diterima
 */
const gracefulShutdown = (signal) => {
  logger.warn('Graceful shutdown initiated', {
    signal,
    pid: process.pid,
    uptime: process.uptime()
  });
  console.log(`\n🛑 Menerima signal ${signal}. Memulai graceful shutdown...`);

  // Stop accepting new connections
  server.close((err) => {
    if (err) {
      logger.error('Error closing HTTP server', {
        error: err.message,
        stack: err.stack
      });
      console.error('❌ Error saat menutup server:', err);
      process.exit(1);
    }

    logger.info('HTTP server closed successfully');
    console.log('✅ Server HTTP ditutup');

    // Close database connections
    const pool = require('./config/db');
    pool.end((err) => {
      if (err) {
        logger.error('Error closing database connections', {
          error: err.message,
          stack: err.stack
        });
        console.error('❌ Error saat menutup koneksi database:', err);
        process.exit(1);
      }

      logger.info('Database connections closed successfully');
      logger.info('Graceful shutdown completed');
      console.log('✅ Koneksi database ditutup');
      console.log('🎯 Graceful shutdown selesai');
      process.exit(0);
    });
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Graceful shutdown timeout - forcing exit', {
      signal,
      timeoutSeconds: 30
    });
    console.error('⚠️  Timeout graceful shutdown (30s). Force exit...');
    process.exit(1);
  }, 30000);
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack,
    pid: process.pid
  });
  console.error('💥 Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString(),
    pid: process.pid
  });
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

logger.info('Graceful shutdown handlers installed');
console.log('🛡️  Graceful shutdown handlers terpasang');
