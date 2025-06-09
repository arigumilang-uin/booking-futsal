const pool = require('../../config/db');

// Create booking history entry
const createBookingHistory = async ({
  booking_id,
  status_from,
  status_to,
  changed_by,
  reason = null,
  notes = null
}) => {
  const action = `STATUS_CHANGE_${status_from}_TO_${status_to}`.toUpperCase();
  const finalNotes = reason ? `${reason}${notes ? ` - ${notes}` : ''}` : notes;

  const query = `
    INSERT INTO booking_history (booking_id, action, old_status, new_status, changed_by, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, booking_id, action, old_status, new_status, changed_by, notes, created_at
  `;
  const values = [booking_id, action, status_from, status_to, changed_by, finalNotes];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get booking history
const getBookingHistory = async (bookingId) => {
  const query = `
    SELECT bh.id, bh.booking_id, bh.action, bh.old_status, bh.new_status,
           bh.changed_by, bh.notes, bh.created_at,
           u.name as changed_by_name, u.role as changed_by_role
    FROM booking_history bh
    LEFT JOIN users u ON bh.changed_by = u.id
    WHERE bh.booking_id = $1
    ORDER BY bh.created_at ASC
  `;
  const result = await pool.query(query, [bookingId]);
  return result.rows;
};

// Get all booking history with pagination
const getAllBookingHistory = async (page = 1, limit = 50, filters = {}) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT bh.id, bh.booking_id, bh.action, bh.old_status, bh.new_status,
           bh.changed_by, bh.notes, bh.created_at,
           u.name as changed_by_name, u.role as changed_by_role,
           b.booking_number, b.user_id, b.field_id, b.date, b.start_time,
           customer.name as customer_name, customer.email as customer_email,
           f.name as field_name
    FROM booking_history bh
    LEFT JOIN users u ON bh.changed_by = u.id
    LEFT JOIN bookings b ON bh.booking_id = b.id
    LEFT JOIN users customer ON b.user_id = customer.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  // Apply filters
  if (filters.booking_id) {
    query += ` AND bh.booking_id = $${paramCount++}`;
    params.push(filters.booking_id);
  }

  if (filters.status_to) {
    query += ` AND bh.new_status = $${paramCount++}`;
    params.push(filters.status_to);
  }

  if (filters.changed_by) {
    query += ` AND bh.changed_by = $${paramCount++}`;
    params.push(filters.changed_by);
  }

  if (filters.date_from) {
    query += ` AND bh.created_at >= $${paramCount++}`;
    params.push(filters.date_from);
  }

  if (filters.date_to) {
    query += ` AND bh.created_at <= $${paramCount++}`;
    params.push(filters.date_to);
  }

  query += ` ORDER BY bh.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

// Get booking status changes statistics
const getStatusChangeStatistics = async (days = 30) => {
  const query = `
    SELECT
      new_status as status_to,
      COUNT(*) as change_count,
      COUNT(DISTINCT booking_id) as unique_bookings,
      COUNT(DISTINCT changed_by) as unique_changers
    FROM booking_history
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY new_status
    ORDER BY change_count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get user activity in booking changes
const getUserBookingActivity = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT bh.id, bh.booking_id, bh.action, bh.old_status, bh.new_status,
           bh.notes, bh.created_at,
           b.booking_number, b.user_id, b.field_id, b.date, b.start_time,
           customer.name as customer_name,
           f.name as field_name
    FROM booking_history bh
    LEFT JOIN bookings b ON bh.booking_id = b.id
    LEFT JOIN users customer ON b.user_id = customer.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE bh.changed_by = $1
    ORDER BY bh.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

// Get booking timeline
const getBookingTimeline = async (bookingId) => {
  const query = `
    SELECT
      'status_change' as event_type,
      bh.id as event_id,
      bh.action,
      CAST(bh.old_status AS TEXT) as status_from,
      CAST(bh.new_status AS TEXT) as status_to,
      CAST(bh.notes AS TEXT) as notes,
      bh.created_at,
      CAST(u.name AS TEXT) as actor_name,
      CAST(u.role AS TEXT) as actor_role
    FROM booking_history bh
    LEFT JOIN users u ON bh.changed_by = u.id
    WHERE bh.booking_id = $1

    UNION ALL

    SELECT
      'payment' as event_type,
      p.id as event_id,
      'payment_created' as action,
      'pending' as status_from,
      CAST(p.status AS TEXT) as status_to,
      CONCAT(CAST(p.method AS TEXT), ' - ', CAST(p.amount AS TEXT)) as notes,
      p.created_at,
      'System' as actor_name,
      'system' as actor_role
    FROM payments p
    WHERE p.booking_id = $1

    ORDER BY created_at ASC
  `;
  const result = await pool.query(query, [bookingId]);
  return result.rows;
};

// Get daily booking changes
const getDailyBookingChanges = async (days = 30) => {
  const query = `
    SELECT
      DATE(created_at) as date,
      COUNT(*) as total_changes,
      COUNT(CASE WHEN new_status = 'confirmed' THEN 1 END) as confirmations,
      COUNT(CASE WHEN new_status = 'cancelled' THEN 1 END) as cancellations,
      COUNT(CASE WHEN new_status = 'completed' THEN 1 END) as completions,
      COUNT(DISTINCT booking_id) as unique_bookings
    FROM booking_history
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get most active staff in booking management
const getMostActiveStaff = async (days = 30, limit = 10) => {
  const query = `
    SELECT
      bh.changed_by,
      u.name as staff_name,
      u.role as staff_role,
      COUNT(*) as total_changes,
      COUNT(CASE WHEN bh.new_status = 'confirmed' THEN 1 END) as confirmations,
      COUNT(CASE WHEN bh.new_status = 'cancelled' THEN 1 END) as cancellations,
      COUNT(CASE WHEN bh.new_status = 'completed' THEN 1 END) as completions,
      COUNT(DISTINCT bh.booking_id) as unique_bookings
    FROM booking_history bh
    LEFT JOIN users u ON bh.changed_by = u.id
    WHERE bh.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      AND bh.changed_by IS NOT NULL
    GROUP BY bh.changed_by, u.name, u.role
    ORDER BY total_changes DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

// Get booking status flow analysis
const getBookingStatusFlow = async (days = 30) => {
  const query = `
    SELECT
      old_status as status_from,
      new_status as status_to,
      COUNT(*) as transition_count,
      COUNT(DISTINCT booking_id) as unique_bookings,
      AVG(EXTRACT(EPOCH FROM (
        SELECT MIN(bh2.created_at)
        FROM booking_history bh2
        WHERE bh2.booking_id = bh.booking_id
        AND bh2.created_at > bh.created_at
      ) - bh.created_at) / 3600) as avg_hours_in_status
    FROM booking_history bh
    WHERE bh.created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY old_status, new_status
    ORDER BY transition_count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Clean old booking history
const cleanOldBookingHistory = async (retentionDays = 365) => {
  const query = `
    DELETE FROM booking_history
    WHERE created_at < CURRENT_DATE - INTERVAL '${retentionDays} days'
    RETURNING COUNT(*) as deleted_count
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

// Log booking status change
const logBookingStatusChange = async (bookingId, statusFrom, statusTo, changedBy, reason = null, notes = null) => {
  return await createBookingHistory({
    // Monitoring data object
    const monitoringData = {
      booking_id: bookingId,
      status_from: statusFrom,
      status_to: statusTo,
      changed_by: changedBy,
      reason,
      notes
    };
    // In production, this would be sent to monitoring service
};

// Get booking history summary
const getBookingHistorySummary = async (bookingId) => {
  const query = `
    SELECT
      COUNT(*) as total_changes,
      MIN(created_at) as first_change,
      MAX(created_at) as last_change,
      COUNT(DISTINCT changed_by) as unique_changers,
      array_agg(DISTINCT new_status ORDER BY new_status) as statuses_reached
    FROM booking_history
    WHERE booking_id = $1
  `;
  const result = await pool.query(query, [bookingId]);
  return result.rows[0];
};

module.exports = {
  createBookingHistory,
  getBookingHistory,
  getAllBookingHistory,
  getStatusChangeStatistics,
  getUserBookingActivity,
  getBookingTimeline,
  getDailyBookingChanges,
  getMostActiveStaff,
  getBookingStatusFlow,
  cleanOldBookingHistory,
  logBookingStatusChange,
  getBookingHistorySummary
};
