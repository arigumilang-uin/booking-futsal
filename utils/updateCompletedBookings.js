const pool = require('../config/db');

const updateCompletedBookings = async () => {
  const result = await pool.query(
    `UPDATE bookings
     SET status = 'completed'
     WHERE status = 'confirmed'
       AND (date < CURRENT_DATE OR (date = CURRENT_DATE AND end_time < CURRENT_TIME))
     RETURNING *`
  );
  return result.rows;
};

module.exports = updateCompletedBookings;
