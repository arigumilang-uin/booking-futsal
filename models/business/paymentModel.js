const pool = require('../../config/db');

const getAllPayments = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.amount, p.method,
           p.status, p.gateway_response, p.paid_at, p.created_at,
           b.booking_number, b.user_id, b.field_id, b.date, b.start_time,
           u.name as user_name, u.email as user_email,
           f.name as field_name
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN fields f ON b.field_id = f.id
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

const getPaymentById = async (id) => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.amount, p.method,
           p.status, p.gateway_response, p.paid_at, p.created_at, p.updated_at,
           b.booking_number, b.user_id, b.field_id, b.date, b.start_time, b.total_amount,
           u.name as user_name, u.email as user_email, u.phone as user_phone,
           f.name as field_name, f.type as field_type
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE p.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createPayment = async (paymentData) => {
  const { booking_id, amount, method = 'manual', status = 'pending' } = paymentData;

  const query = `
    INSERT INTO payments (booking_id, amount, method, status)
    VALUES ($1, $2, $3, $4)
    RETURNING id, uuid, payment_number, booking_id, amount, method, status, created_at
  `;
  const values = [booking_id, amount, method, status];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updatePaymentStatus = async (id, status, gatewayResponse = null) => {
  const query = `
    UPDATE payments
    SET status = $1,
        gateway_response = $2,
        paid_at = CASE WHEN $1 = 'paid' THEN NOW() ELSE paid_at END,
        updated_at = NOW()
    WHERE id = $3
    RETURNING id, uuid, payment_number, status, paid_at, updated_at
  `;
  const result = await pool.query(query, [status, gatewayResponse, id]);
  return result.rows[0];
};

const getPaymentsByBookingId = async (bookingId) => {
  const query = `
    SELECT id, uuid, payment_number, booking_id, amount, method, status,
           gateway_response, paid_at, created_at
    FROM payments
    WHERE booking_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [bookingId]);
  return result.rows;
};

const getPaymentsByUserId = async (userId) => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.amount, p.method,
           p.status, p.gateway_response, p.paid_at, p.created_at,
           b.booking_number, b.date, b.start_time,
           f.name as field_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    JOIN fields f ON b.field_id = f.id
    WHERE b.user_id = $1
    ORDER BY p.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

const getPaymentsByStatus = async (status) => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.amount, p.method,
           p.status, p.gateway_response, p.paid_at, p.created_at,
           b.booking_number, b.user_id, b.date, b.start_time,
           u.name as user_name, u.email as user_email,
           f.name as field_name
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE p.status = $1
    ORDER BY p.created_at DESC
  `;
  const result = await pool.query(query, [status]);
  return result.rows;
};

const getTodayPayments = async () => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.amount, p.method,
           p.status, p.gateway_response, p.paid_at, p.created_at,
           b.booking_number, b.user_id, b.date, b.start_time,
           u.name as user_name, u.email as user_email,
           f.name as field_name
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE DATE(p.created_at) = CURRENT_DATE
    ORDER BY p.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getPaymentStatistics = async (startDate, endDate) => {
  const query = `
    SELECT
      COUNT(*) as total_payments,
      COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_payments,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_payments,
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_revenue,
      AVG(CASE WHEN status = 'paid' THEN amount ELSE NULL END) as average_payment,
      COUNT(DISTINCT booking_id) as unique_bookings
    FROM payments
    WHERE created_at BETWEEN $1 AND $2
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows[0];
};

const getRevenueByMethod = async (startDate, endDate) => {
  const query = `
    SELECT
      method,
      COUNT(*) as payment_count,
      SUM(amount) as total_amount,
      AVG(amount) as average_amount
    FROM payments
    WHERE status = 'paid' AND created_at BETWEEN $1 AND $2
    GROUP BY method
    ORDER BY total_amount DESC
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

const getPendingPayments = async () => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.amount, p.method,
           p.status, p.created_at,
           b.booking_number, b.user_id, b.date, b.start_time,
           u.name as user_name, u.email as user_email, u.phone as user_phone,
           f.name as field_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    JOIN users u ON b.user_id = u.id
    JOIN fields f ON b.field_id = f.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const deletePayment = async (id) => {
  const query = `
    UPDATE payments
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = $1
    RETURNING id, status, updated_at
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  getPaymentsByBookingId,
  getPaymentsByUserId,
  getPaymentsByStatus,
  getTodayPayments,
  getPaymentStatistics,
  getRevenueByMethod,
  getPendingPayments,
  deletePayment
};
