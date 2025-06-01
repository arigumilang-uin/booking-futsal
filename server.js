const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = require('./app');
const cron = require('node-cron');
const { updateCompletedBookings } = require('./utils/updateCompletedBookings');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - Health Check: http://localhost:${PORT}/api/test/health`);
  console.log(`   - Routes List: http://localhost:${PORT}/api/test/routes`);
  console.log(`   - Database Test: http://localhost:${PORT}/api/test/database`);
});

// Auto-completion cron job - runs every 30 minutes
const cronSchedule = process.env.AUTO_COMPLETION_SCHEDULE || '*/30 * * * *';
const enableAutoCron = process.env.ENABLE_AUTO_COMPLETION !== 'false';

if (enableAutoCron) {
  console.log(`🕒 Auto-completion cron job scheduled: ${cronSchedule}`);

  cron.schedule(cronSchedule, async () => {
    try {
      console.log('[CRON] Starting auto-completion check...');
      const updated = await updateCompletedBookings();

      if (updated.length > 0) {
        console.log(`[CRON] ✅ ${updated.length} booking(s) auto-completed successfully`);
      } else {
        console.log('[CRON] ℹ️ No bookings to complete at this time');
      }
    } catch (err) {
      console.error('[CRON] ❌ Auto-completion error:', err);
    }
  }, {
    scheduled: true,
    timezone: process.env.TZ || 'Asia/Jakarta'
  });
} else {
  console.log('⏸️ Auto-completion cron job disabled via environment variable');
}
