const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = require('./app');
const cron = require('node-cron');
const { updateCompletedBookings } = require('./utils/updateCompletedBookings');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

cron.schedule('*/30 * * * *', async () => {
  try {
    const updated = await updateCompletedBookings();
    if (updated.length > 0) {
      console.log(`${updated.length} booking completed`);
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
});
