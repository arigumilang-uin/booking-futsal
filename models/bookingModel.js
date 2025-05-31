const pool = require('../config/db');

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
  const query = `
    SELECT b.id, b.uuid, b.booking_number, b.user_id, b.field_id, b.date,
           b.start_time, b.end_time, b.duration_hours, b.name, b.phone, b.email, b.notes,
           b.base_amount, b.discount_amount, b.admin_fee, b.total_amount,
           b.status, b.payment_status, b.confirmed_by, b.cancelled_by, b.completed_by,
           b.cancellation_reason, b.cancelled_at, b.confirmed_at, b.completed_at,
           b.reminder_sent, b.created_at, b.updated_at,
           u.name as user_name, u.email as user_email, u.phone as user_phone,
           f.name as field_name, f.type as field_type, f.location as field_location,
           f.price as field_price, f.image_url as field_image,
           cb.name as confirmed_by_name, cb.employee_id as confirmed_by_employee_id,
           canb.name as cancelled_by_name, canb.employee_id as cancelled_by_employee_id,
           cob.name as completed_by_name, cob.employee_id as completed_by_employee_id
    FROM bookings b
    LEFT JOIN users u ON b.user_id = u.id
    LEFT JOIN fields f ON b.field_id = f.id
    LEFT JOIN users cb ON b.confirmed_by = cb.id
    LEFT JOIN users canb ON b.cancelled_by = canb.id
    LEFT JOIN users cob ON b.completed_by = cob.id
    WHERE b.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getBookingsByUserId = async (user_id) => {
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
  `;
  const result = await pool.query(query, [user_id]);
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
      AND status IN ('pending', 'confirmed')
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
  return result.rows[0];
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

const getBookingsByStatus = async (status) => {
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
  `;
  const result = await pool.query(query, [status]);
  return result.rows;
};

const getTodayBookings = async () => {
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
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getUpcomingBookings = async (days = 7) => {
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
    WHERE b.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
      AND b.status IN ('pending', 'confirmed')
    ORDER BY b.date ASC, b.start_time ASC
  `;
  const result = await pool.query(query);
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
      AVG(total_price) as average_booking_value
    FROM bookings
    WHERE created_at BETWEEN $1 AND $2
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows[0];
};

const getRevenueStatistics = async (startDate, endDate) => {
  const query = `
    SELECT
      SUM(total_price) as total_revenue,
      SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as confirmed_revenue,
      AVG(total_price) as average_revenue_per_booking,
      COUNT(*) as total_bookings_with_revenue
    FROM bookings
    WHERE created_at BETWEEN $1 AND $2
    AND status IN ('confirmed', 'completed')
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows[0];
};

const getBookingsByUserIdPaginated = async (userId, page = 1, limit = 10, status = null) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT b.id, b.uuid, b.name, b.email, b.phone, b.date, b.start_time, b.end_time,
           b.duration, b.total_price, b.status, b.payment_status, b.notes,
           b.created_at, b.updated_at,
           f.name as field_name, f.type as field_type, f.location as field_location
    FROM bookings b
    JOIN fields f ON b.field_id = f.id
    WHERE b.user_id = $1
  `;

  const params = [userId];
  let paramCount = 2;

  if (status) {
    query += ` AND b.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  query += ` ORDER BY b.date DESC, b.start_time DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  let countQuery = 'SELECT COUNT(*) FROM bookings WHERE user_id = $1';
  const countParams = [userId];

  if (status) {
    countQuery += ' AND status = $2';
    countParams.push(status);
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalItems = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    bookings: result.rows,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_items: totalItems,
      items_per_page: limit,
      has_next: page < totalPages,
      has_prev: page > 1
    }
  };
};

const getPaginatedBookings = async (filters = {}, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT b.id, b.uuid, b.name, b.email, b.phone, b.date, b.start_time, b.end_time,
           b.duration, b.total_price, b.status, b.payment_status, b.notes,
           b.created_at, b.updated_at,
           f.name as field_name, f.type as field_type, f.location as field_location,
           u.name as user_name, u.email as user_email
    FROM bookings b
    JOIN fields f ON b.field_id = f.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  if (filters.status) {
    query += ` AND b.status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  }

  if (filters.field_id) {
    query += ` AND b.field_id = $${paramCount}`;
    params.push(filters.field_id);
    paramCount++;
  }

  if (filters.user_id) {
    query += ` AND b.user_id = $${paramCount}`;
    params.push(filters.user_id);
    paramCount++;
  }

  if (filters.date_from) {
    query += ` AND b.date >= $${paramCount}`;
    params.push(filters.date_from);
    paramCount++;
  }

  if (filters.date_to) {
    query += ` AND b.date <= $${paramCount}`;
    params.push(filters.date_to);
    paramCount++;
  }

  query += ` ORDER BY b.date DESC, b.start_time DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  let countQuery = 'SELECT COUNT(*) FROM bookings b WHERE 1=1';
  const countParams = [];
  let countParamCount = 1;

  if (filters.status) {
    countQuery += ` AND b.status = $${countParamCount}`;
    countParams.push(filters.status);
    countParamCount++;
  }

  if (filters.field_id) {
    countQuery += ` AND b.field_id = $${countParamCount}`;
    countParams.push(filters.field_id);
    countParamCount++;
  }

  if (filters.user_id) {
    countQuery += ` AND b.user_id = $${countParamCount}`;
    countParams.push(filters.user_id);
    countParamCount++;
  }

  if (filters.date_from) {
    countQuery += ` AND b.date >= $${countParamCount}`;
    countParams.push(filters.date_from);
    countParamCount++;
  }

  if (filters.date_to) {
    countQuery += ` AND b.date <= $${countParamCount}`;
    countParams.push(filters.date_to);
    countParamCount++;
  }

  const countResult = await pool.query(countQuery, countParams);
  const totalItems = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    bookings: result.rows,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_items: totalItems,
      items_per_page: limit,
      has_next: page < totalPages,
      has_prev: page > 1
    }
  };
};

const getBookingsEligibleForCompletion = async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 8);
  const currentDate = now.toISOString().split('T')[0];

  const query = `
    SELECT
      b.id, b.uuid, b.booking_number, b.date, b.start_time, b.end_time,
      b.status, b.user_id, b.field_id,
      CONCAT(b.date, ' ', b.end_time)::timestamp as booking_end_datetime,
      CONCAT(b.date, ' ', b.end_time)::timestamp + INTERVAL '15 minutes' as grace_period_end,
      f.name as field_name, u.name as user_name
    FROM bookings b
    LEFT JOIN fields f ON b.field_id = f.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.status = 'confirmed'
      AND (
        (b.date < $1) OR
        (b.date = $1 AND b.end_time <= $2)
      )
      AND b.completed_at IS NULL
    ORDER BY b.date ASC, b.end_time ASC
  `;

  const result = await pool.query(query, [currentDate, currentTime]);
  return result.rows;
};

const getExpiredBookings = async (gracePeriodMinutes = 15) => {
  const query = `
    SELECT
      b.id, b.uuid, b.booking_number, b.date, b.start_time, b.end_time,
      b.status, b.user_id, b.field_id,
      f.name as field_name, u.name as user_name
    FROM bookings b
    LEFT JOIN fields f ON b.field_id = f.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.status = 'confirmed'
      AND CONCAT(b.date, ' ', b.end_time)::timestamp + INTERVAL '${gracePeriodMinutes} minutes' <= NOW()
      AND b.completed_at IS NULL
    ORDER BY b.date ASC, b.end_time ASC
  `;

  const result = await pool.query(query);
  return result.rows;
};

const isBookingEligibleForCompletion = async (bookingId) => {
  const query = `
    SELECT
      b.id, b.status, b.date, b.end_time, b.completed_at,
      CONCAT(b.date, ' ', b.end_time)::timestamp + INTERVAL '15 minutes' as grace_period_end
    FROM bookings b
    WHERE b.id = $1
  `;

  const result = await pool.query(query, [bookingId]);

  if (result.rows.length === 0) {
    return { eligible: false, reason: 'Booking not found' };
  }

  const booking = result.rows[0];
  const now = new Date();

  if (booking.status !== 'confirmed') {
    return { eligible: false, reason: 'Booking is not confirmed' };
  }

  if (booking.completed_at) {
    return { eligible: false, reason: 'Booking already completed' };
  }

  if (now < new Date(booking.grace_period_end)) {
    return { eligible: false, reason: 'Still in grace period' };
  }

  return { eligible: true, booking: booking };
};

const autoCompleteBooking = async (bookingId, reason = 'Auto-completed by system') => {
  try {
    const eligibility = await isBookingEligibleForCompletion(bookingId);

    if (!eligibility.eligible) {
      throw new Error(`Cannot auto-complete booking: ${eligibility.reason}`);
    }

    const updatedBooking = await updateBookingStatus(
      bookingId,
      'completed',
      null,
      reason
    );

    return {
      success: true,
      booking: updatedBooking,
      completed_at: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      booking_id: bookingId
    };
  }
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
  getRevenueStatistics,
  getBookingsByUserIdPaginated,
  getPaginatedBookings,
  getBookingsEligibleForCompletion,
  getExpiredBookings,
  isBookingEligibleForCompletion,
  autoCompleteBooking,
};
