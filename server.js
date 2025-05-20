const app = require('./app');
const dotenv = require('dotenv');
const cron = require('node-cron');
const updateCompletedBookings = require('./utils/updateCompletedBookings');

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

// Jalankan pengecekan setiap 30 menit
cron.schedule('*/30 * * * *', async () => {
  try {
    const updated = await updateCompletedBookings();
    if (updated.length > 0) {
      console.log(`[CRON] ${updated.length} booking ditandai completed.`);
    }
  } catch (err) {
    console.error('[CRON ERROR]', err);
  }
});
