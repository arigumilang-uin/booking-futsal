const pool = require('../config/db');

const getAllBookings = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    'SELECT * FROM bookings ORDER BY date, start_time LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return result.rows;
};

const getBookingById = async (id) => {
  const result = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
  return result.rows[0];
};

const createBooking = async ({ user_id, field_id, date, start_time, end_time, status = 'pending' }) => {
  const result = await pool.query(
    'INSERT INTO bookings (user_id, field_id, date, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [user_id, field_id, date, start_time, end_time, status]
  );
  return result.rows[0];
};

const updateBookingStatus = async (id, status) => {
  const result = await pool.query(
    'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

const deleteBooking = async (id) => {
  await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
};
