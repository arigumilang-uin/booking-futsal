const pool = require('../../config/db');
const { logBookingStatusChange } = require('../tracking/bookingHistoryModel');

const getAllBookings = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT b.id, b.uuid, b.booking_number, b.user_id, b.field_id, b.date,
           b.start_time, b.end_time, b.duration_hours, b.name, b.phone, b.email,
           b.base_amount, b.discount_amount, b.admin_fee, b.total_amount,
           b.status, b.payment_status, b.created_at, b.updated_at,
           u.name as user_name, u.email as user_email,
           f.name as field_name, f.type as field_type, f.location as field_location
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN fields f ON b.field_id = f.id
    ORDER BY b.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

const getBookingById = async (id) => {
  // Optimized: Split complex query into smaller, indexed queries
  const bookingQuery = `
    SELECT b.id, b.uuid, b.booking_number, b.user_id, b.field_id, b.date,
           b.start_time, b.end_time, b.duration_hours, b.name, b.phone, b.email, b.notes,
           b.base_amount, b.discount_amount, b.admin_fee, b.total_amount,
           b.status, b.payment_status, b.confirmed_by, b.cancelled_by, b.completed_by,
           b.cancellation_reason, b.cancelled_at, b.confirmed_at, b.completed_at,
           b.reminder_sent, b.created_at, b.updated_at
    FROM bookings b
    WHERE b.id = $1
  `;

  const bookingResult = await pool.query(bookingQuery, [id]);
  if (!bookingResult.rows[0]) {
    return null;
  }

  const booking = bookingResult.rows[0];

  // Get user info (indexed by user_id)
  const userQuery = `
    SELECT name as user_name, email as user_email, phone as user_phone
    FROM users WHERE id = $1
  `;
  const userResult = await pool.query(userQuery, [booking.user_id]);

  // Get field info (indexed by field_id)
  const fieldQuery = `
    SELECT name as field_name, type as field_type, location as field_location,
           price as field_price, image_url as field_image
    FROM fields WHERE id = $1
  `;
  const fieldResult = await pool.query(fieldQuery, [booking.field_id]);

  // Get staff info only if needed (conditional queries for better performance)
  let confirmedBy = null, cancelledBy = null, completedBy = null;

  if (booking.confirmed_by) {
    const confirmedByQuery = `
      SELECT name as confirmed_by_name, employee_id as confirmed_by_employee_id
      FROM users WHERE id = $1
    `;
    const confirmedByResult = await pool.query(confirmedByQuery, [booking.confirmed_by]);
    confirmedBy = confirmedByResult.rows[0];
  }

  if (booking.cancelled_by) {
    const cancelledByQuery = `
      SELECT name as cancelled_by_name, employee_id as cancelled_by_employee_id
      FROM users WHERE id = $1
    `;
    const cancelledByResult = await pool.query(cancelledByQuery, [booking.cancelled_by]);
    cancelledBy = cancelledByResult.rows[0];
  }

  if (booking.completed_by) {
    const completedByQuery = `
      SELECT name as completed_by_name, employee_id as completed_by_employee_id
      FROM users WHERE id = $1
    `;
    const completedByResult = await pool.query(completedByQuery, [booking.completed_by]);
    completedBy = completedByResult.rows[0];
  }

  // Combine results
  return {
    ...booking,
    ...userResult.rows[0],
    ...fieldResult.rows[0],
    ...confirmedBy,
    ...cancelledBy,
    ...completedBy
  };
};

const getBookingsByUserId = async (user_id, limit = 50) => {
  // Optimized: Added LIMIT to prevent large result sets
  const query = `
    SELECT b.id, b.uuid, b.booking_number, b.user_id, b.field_id, b.date,
           b.start_time, b.end_time, b.duration_hours, b.name, b.phone, b.email,
           b.base_amount, b.discount_amount, b.admin_fee, b.total_amount,
           b.status, b.payment_status, b.created_at, b.updated_at,
           f.name as field_name, f.type as field_type, f.location as field_location,
           f.price as field_price, f.image_url as field_image
    FROM bookings b
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE b.user_id = $1
    ORDER BY b.created_at DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [user_id, limit]);
  return result.rows;
};

const createBooking = async (bookingData) => {
  const {
    user_id, field_id, date, start_time, end_time, name, phone, email, notes,
    base_amount, discount_amount = 0, admin_fee = 0, status = 'pending', created_by = null
  } = bookingData;

  const query = `
    INSERT INTO bookings (
      user_id, field_id, date, start_time, end_time, name, phone, email, notes,
      base_amount, discount_amount, admin_fee, status, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id, uuid, booking_number, user_id, field_id, date, start_time, end_time,
              duration_hours, name, phone, email, notes, base_amount, discount_amount,
              admin_fee, total_amount, status, payment_status, created_at
  `;
  const values = [
    user_id, field_id, date, start_time, end_time, name, phone, email, notes,
    base_amount, discount_amount, admin_fee, status, created_by
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const checkBookingConflict = async ({ field_id, date, start_time, end_time, exclude_booking_id = null }) => {
  let query = `
    SELECT id, booking_number, start_time, end_time, status
    FROM bookings
    WHERE field_id = $1
      AND date = $2
      AND status IN ('pending', 'confirmed', 'completed')
      AND (
        ($3 < end_time AND $4 > start_time)
      )
  `;
  let values = [field_id, date, start_time, end_time];

  if (exclude_booking_id) {
    query += ' AND id != $5';
    values.push(exclude_booking_id);
  }

  const result = await pool.query(query, values);
  return {
    hasConflict: result.rows.length > 0,
    conflicts: result.rows
  };
};

const updateBookingStatus = async (id, status, updatedBy = null, reason = null) => {
  try {
    // Get current booking status for logging
    const currentBookingQuery = 'SELECT status FROM bookings WHERE id = $1';
    const currentBookingResult = await pool.query(currentBookingQuery, [id]);
    const currentStatus = currentBookingResult.rows[0]?.status || 'unknown';

    let query, values;

    if (status === 'confirmed') {
      query = `
        UPDATE bookings
        SET status = $1, confirmed_by = $2, confirmed_at = NOW(), updated_at = NOW()
        WHERE id = $3
        RETURNING id, uuid, booking_number, status, confirmed_at
      `;
      values = [status, updatedBy, id];
    } else if (status === 'cancelled') {
      query = `
        UPDATE bookings
        SET status = $1, cancelled_by = $2, cancelled_at = NOW(),
            cancellation_reason = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING id, uuid, booking_number, status, cancelled_at, cancellation_reason
      `;
      values = [status, updatedBy, reason, id];
    } else if (status === 'completed') {
      query = `
        UPDATE bookings
        SET status = $1, completed_by = $2, completed_at = NOW(), updated_at = NOW()
        WHERE id = $3
        RETURNING id, uuid, booking_number, status, completed_at
      `;
      values = [status, updatedBy, id];
    } else {
      query = `
        UPDATE bookings
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, uuid, booking_number, status, updated_at
      `;
      values = [status, id];
    }

    const result = await pool.query(query, values);
    const updatedBooking = result.rows[0];

    // Log the status change to booking_history
    if (updatedBooking && currentStatus !== status) {
      try {
        await logBookingStatusChange(
          id,
          currentStatus,
          status,
          updatedBy,
          reason,
          `Status changed from ${currentStatus} to ${status}`
        );
        console.log(`✅ Booking history logged: ${currentStatus} → ${status} for booking ${id}`);
      } catch (logError) {
        console.error('❌ Failed to log booking status change:', logError);
        // Don't fail the main operation if logging fails
      }
    }

    return updatedBooking;
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    throw error;
  }
};

const deleteBooking = async (id) => {
  const query = `
    UPDATE bookings
    SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
    WHERE id = $1
  `;
  await pool.query(query, [id]);
};

const updatePaymentStatus = async (id, paymentStatus) => {
  const query = `
    UPDATE bookings
    SET payment_status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, uuid, booking_number, payment_status, updated_at
  `;
  const result = await pool.query(query, [paymentStatus, id]);
  return result.rows[0];
};

const getBookingsByStatus = async (status, limit = 100) => {
  // Optimized: Added LIMIT to prevent large result sets
  const query = `
    SELECT b.id, b.uuid, b.booking_number, b.user_id, b.field_id, b.date,
           b.start_time, b.end_time, b.duration_hours, b.name, b.phone, b.email,
           b.base_amount, b.discount_amount, b.admin_fee, b.total_amount,
           b.status, b.payment_status, b.created_at, b.updated_at,
           u.name as user_name, u.email as user_email,
           f.name as field_name, f.type as field_type, f.location as field_location
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE b.status = $1
    ORDER BY b.created_at DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [status, limit]);
  return result.rows;
};

const getTodayBookings = async (limit = 50) => {
  // Optimized: Added LIMIT for today's bookings
  const query = `
    SELECT b.id, b.uuid, b.booking_number, b.user_id, b.field_id, b.date,
           b.start_time, b.end_time, b.duration_hours, b.name, b.phone, b.email,
           b.base_amount, b.discount_amount, b.admin_fee, b.total_amount,
           b.status, b.payment_status, b.created_at, b.updated_at,
           u.name as user_name, u.email as user_email,
           f.name as field_name, f.type as field_type, f.location as field_location
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE b.date = CURRENT_DATE
    ORDER BY b.start_time ASC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

const getUpcomingBookings = async (days = 7, limit = 100) => {
  // Fixed: Use proper parameterized query for interval
  const query = `
    SELECT b.id, b.uuid, b.booking_number, b.user_id, b.field_id, b.date,
           b.start_time, b.end_time, b.duration_hours, b.name, b.phone, b.email,
           b.base_amount, b.discount_amount, b.admin_fee, b.total_amount,
           b.status, b.payment_status, b.created_at, b.updated_at,
           u.name as user_name, u.email as user_email,
           f.name as field_name, f.type as field_type, f.location as field_location
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE b.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * $1
      AND b.status IN ('pending', 'confirmed')
    ORDER BY b.date ASC, b.start_time ASC
    LIMIT $2
  `;
  const result = await pool.query(query, [days, limit]);
  return result.rows;
};

const getBookingStatistics = async (startDate, endDate) => {
  const query = `
    SELECT
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
      COUNT(DISTINCT user_id) as unique_customers,
      AVG(total_amount) as average_booking_value
    FROM bookings
    WHERE created_at BETWEEN $1 AND $2
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows[0];
};

const getRevenueStatistics = async (startDate, endDate) => {
  const query = `
    SELECT
      SUM(total_amount) as total_revenue,
      SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as confirmed_revenue,
      AVG(total_amount) as average_revenue_per_booking,
      COUNT(*) as total_bookings_with_revenue
    FROM bookings
    WHERE created_at BETWEEN $1 AND $2
    AND status IN ('confirmed', 'completed')
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows[0];
};

module.exports = {
  getAllBookings,
  getBookingById,
  getBookingsByUserId,
  createBooking,
  checkBookingConflict,
  updateBookingStatus,
  deleteBooking,
  updatePaymentStatus,
  getBookingsByStatus,
  getTodayBookings,
  getUpcomingBookings,
  getBookingStatistics,
  getRevenueStatistics
};
