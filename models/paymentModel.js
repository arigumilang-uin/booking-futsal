const pool = require('../config/db');

const getAllPayments = async () => {
  const result = await pool.query('SELECT * FROM payments ORDER BY paid_at DESC');
  return result.rows;
};

const getPaymentById = async (id) => {
  const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
  return result.rows[0];
};

const createPayment = async ({ booking_id, method, amount, status = 'unpaid', paid_at = null }) => {
  const result = await pool.query(
    'INSERT INTO payments (booking_id, method, amount, status, paid_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [booking_id, method, amount, status, paid_at]
  );
  return result.rows[0];
};

const updatePaymentStatus = async (id, status, paid_at) => {
  const result = await pool.query(
    'UPDATE payments SET status = $1, paid_at = $2 WHERE id = $3 RETURNING *',
    [status, paid_at, id]
  );
  return result.rows[0];
};

const deletePayment = async (id) => {
  const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  deletePayment,
};
