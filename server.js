const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = require('./app');
// const cron = require('node-cron');
// const { updateCompletedBookings } = require('./utils/updateCompletedBookings');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - Health Check: http://localhost:${PORT}/api/test/health`);
  console.log(`   - Routes List: http://localhost:${PORT}/api/test/routes`);
  console.log(`   - Database Test: http://localhost:${PORT}/api/test/database`);
});

// Cron job commented out for testing
// cron.schedule('*/30 * * * *', async () => {
//   try {
//     const updated = await updateCompletedBookings();
//     if (updated.length > 0) {
//       console.log(`${updated.length} booking completed`);
//     }
//   } catch (err) {
//     console.error('Cron error:', err);
//   }
// });
