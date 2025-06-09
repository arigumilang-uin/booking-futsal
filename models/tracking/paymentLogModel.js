const pool = require('../../config/db');

// Create payment log entry
const createPaymentLog = async ({
  payment_id,
  action,
  status_from = null,
  status_to = null,
  gateway_request = null,
  gateway_response = null,
  amount = null,
  notes = null,
  processed_by = null
}) => {
  // Prepare request_data and response_data as JSON
  const requestData = gateway_request ? JSON.stringify(gateway_request) : null;
  const responseData = gateway_response ? JSON.stringify(gateway_response) : null;

  // Determine status_code from response
  let statusCode = null;
  if (gateway_response && typeof gateway_response === 'object') {
    statusCode = gateway_response.status_code || gateway_response.statusCode || 200;
  }

  // Prepare error_message
  let errorMessage = null;
  if (gateway_response && gateway_response.error) {
    errorMessage = typeof gateway_response.error === 'string' ? gateway_response.error : JSON.stringify(gateway_response.error);
  }

  const query = `
    INSERT INTO payment_logs (payment_id, action, request_data, response_data, status_code, error_message)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, payment_id, action, request_data, response_data, status_code, error_message, created_at
  `;
  const values = [payment_id, action, requestData, responseData, statusCode, errorMessage];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get payment logs
const getPaymentLogs = async (paymentId) => {
  const query = `
    SELECT pl.id, pl.payment_id, pl.action, pl.request_data, pl.response_data,
           pl.status_code, pl.error_message, pl.created_at
    FROM payment_logs pl
    WHERE pl.payment_id = $1
    ORDER BY pl.created_at ASC
  `;
  const result = await pool.query(query, [paymentId]);
  return result.rows;
};

// Get all payment logs with pagination
const getAllPaymentLogs = async (page = 1, limit = 50, filters = {}) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT pl.id, pl.uuid, pl.payment_id, pl.action, pl.status_from, pl.status_to,
           pl.gateway_request, pl.gateway_response, pl.amount, pl.notes,
           pl.processed_by, pl.created_at,
           u.name as processed_by_name, u.role as processed_by_role,
           p.payment_number, p.booking_id, p.method, p.status as current_status,
           b.booking_number, b.user_id, b.field_id,
           customer.name as customer_name, customer.email as customer_email,
           f.name as field_name
    FROM payment_logs pl
    LEFT JOIN users u ON pl.processed_by = u.id
    LEFT JOIN payments p ON pl.payment_id = p.id
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN users customer ON b.user_id = customer.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  // Apply filters
  if (filters.payment_id) {
    query += ` AND pl.payment_id = $${paramCount++}`;
    params.push(filters.payment_id);
  }

  if (filters.action) {
    query += ` AND pl.action = $${paramCount++}`;
    params.push(filters.action);
  }

  if (filters.status_to) {
    query += ` AND pl.status_to = $${paramCount++}`;
    params.push(filters.status_to);
  }

  if (filters.processed_by) {
    query += ` AND pl.processed_by = $${paramCount++}`;
    params.push(filters.processed_by);
  }

  if (filters.date_from) {
    query += ` AND pl.created_at >= $${paramCount++}`;
    params.push(filters.date_from);
  }

  if (filters.date_to) {
    query += ` AND pl.created_at <= $${paramCount++}`;
    params.push(filters.date_to);
  }

  query += ` ORDER BY pl.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

// Get payment action statistics
const getPaymentActionStatistics = async (days = 30) => {
  const query = `
    SELECT
      action,
      COUNT(*) as action_count,
      COUNT(DISTINCT payment_id) as unique_payments,
      COUNT(DISTINCT processed_by) as unique_processors,
      SUM(amount) as total_amount
    FROM payment_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      AND amount IS NOT NULL
    GROUP BY action
    ORDER BY action_count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get user payment activity
const getUserPaymentActivity = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT pl.id, pl.uuid, pl.payment_id, pl.action, pl.status_from, pl.status_to,
           pl.amount, pl.notes, pl.created_at,
           p.payment_number, p.booking_id, p.method,
           b.booking_number, b.field_id,
           f.name as field_name
    FROM payment_logs pl
    LEFT JOIN payments p ON pl.payment_id = p.id
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE pl.processed_by = $1
    ORDER BY pl.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

// Get payment timeline
const getPaymentTimeline = async (paymentId) => {
  const query = `
    SELECT
      'payment_log' as event_type,
      pl.id as event_id,
      pl.action,
      pl.status_from,
      pl.status_to,
      pl.amount,
      pl.notes,
      pl.created_at,
      u.name as actor_name,
      u.role as actor_role,
      pl.gateway_request,
      pl.gateway_response
    FROM payment_logs pl
    LEFT JOIN users u ON pl.processed_by = u.id
    WHERE pl.payment_id = $1
    ORDER BY pl.created_at ASC
  `;
  const result = await pool.query(query, [paymentId]);
  return result.rows;
};

// Get daily payment activities
const getDailyPaymentActivities = async (days = 30) => {
  const query = `
    SELECT
      DATE(created_at) as date,
      COUNT(*) as total_activities,
      COUNT(CASE WHEN action = 'created' THEN 1 END) as payments_created,
      COUNT(CASE WHEN action = 'processed' THEN 1 END) as payments_processed,
      COUNT(CASE WHEN action = 'failed' THEN 1 END) as payments_failed,
      COUNT(CASE WHEN action = 'refunded' THEN 1 END) as payments_refunded,
      COUNT(DISTINCT payment_id) as unique_payments,
      SUM(CASE WHEN action = 'processed' AND amount IS NOT NULL THEN amount ELSE 0 END) as total_processed_amount
    FROM payment_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get gateway response analysis
const getGatewayResponseAnalysis = async (days = 30) => {
  const query = `
    SELECT
      action,
      COUNT(*) as total_requests,
      COUNT(CASE WHEN gateway_response IS NOT NULL THEN 1 END) as responses_received,
      COUNT(CASE WHEN gateway_response::text LIKE '%success%' OR gateway_response::text LIKE '%approved%' THEN 1 END) as successful_responses,
      COUNT(CASE WHEN gateway_response::text LIKE '%error%' OR gateway_response::text LIKE '%failed%' THEN 1 END) as failed_responses
    FROM payment_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      AND gateway_request IS NOT NULL
    GROUP BY action
    ORDER BY total_requests DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get most active payment processors
const getMostActivePaymentProcessors = async (days = 30, limit = 10) => {
  const query = `
    SELECT
      pl.processed_by,
      u.name as processor_name,
      u.role as processor_role,
      COUNT(*) as total_activities,
      COUNT(CASE WHEN pl.action = 'processed' THEN 1 END) as payments_processed,
      COUNT(CASE WHEN pl.action = 'refunded' THEN 1 END) as refunds_processed,
      COUNT(DISTINCT pl.payment_id) as unique_payments,
      SUM(CASE WHEN pl.action = 'processed' AND pl.amount IS NOT NULL THEN pl.amount ELSE 0 END) as total_amount_processed
    FROM payment_logs pl
    LEFT JOIN users u ON pl.processed_by = u.id
    WHERE pl.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      AND pl.processed_by IS NOT NULL
    GROUP BY pl.processed_by, u.name, u.role
    ORDER BY total_activities DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

// Get payment status flow analysis
const getPaymentStatusFlow = async (days = 30) => {
  const query = `
    SELECT
      status_from,
      status_to,
      COUNT(*) as transition_count,
      COUNT(DISTINCT payment_id) as unique_payments,
      AVG(amount) as avg_amount,
      SUM(amount) as total_amount
    FROM payment_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      AND status_from IS NOT NULL
      AND status_to IS NOT NULL
    GROUP BY status_from, status_to
    ORDER BY transition_count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Clean old payment logs
const cleanOldPaymentLogs = async (retentionDays = 365) => {
  const query = `
    DELETE FROM payment_logs
    WHERE created_at < CURRENT_DATE - INTERVAL '${retentionDays} days'
    RETURNING COUNT(*) as deleted_count
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

// Log payment creation
const logPaymentCreation = async (paymentId, amount, processedBy = null) => {
  return await createPaymentLog({
    // Monitoring data object
    const monitoringData = {
      payment_id: paymentId,
      action: 'created',
      status_to: 'pending',
      amount: amount,
      notes: 'Payment created',
      processed_by: processedBy
    };
    // In production, this would be sent to monitoring service
};

// Log payment processing
const logPaymentProcessing = async (paymentId, statusFrom, statusTo, gatewayRequest, gatewayResponse, processedBy = null) => {
  return await createPaymentLog({
    // Monitoring data object
    const monitoringData = {
      payment_id: paymentId,
      action: 'processed',
      status_from: statusFrom,
      status_to: statusTo,
      gateway_request: gatewayRequest,
      gateway_response: gatewayResponse,
      notes: `Payment ${statusTo}`,
      processed_by: processedBy
    };
    // In production, this would be sent to monitoring service
};

// Log payment refund
const logPaymentRefund = async (paymentId, refundAmount, reason, processedBy) => {
  return await createPaymentLog({
    // Monitoring data object
    const monitoringData = {
      payment_id: paymentId,
      action: 'refunded',
      status_from: 'paid',
      status_to: 'refunded',
      amount: refundAmount,
      notes: `Refund: ${reason}`,
      processed_by: processedBy
    };
    // In production, this would be sent to monitoring service
};

// Get payment log summary
const getPaymentLogSummary = async (paymentId) => {
  const query = `
    SELECT
      COUNT(*) as total_logs,
      MIN(created_at) as first_log,
      MAX(created_at) as last_log,
      COUNT(DISTINCT processed_by) as unique_processors,
      array_agg(DISTINCT action ORDER BY action) as actions_performed,
      COUNT(CASE WHEN gateway_response IS NOT NULL THEN 1 END) as gateway_interactions
    FROM payment_logs
    WHERE payment_id = $1
  `;
  const result = await pool.query(query, [paymentId]);
  return result.rows[0];
};

module.exports = {
  createPaymentLog,
  getPaymentLogs,
  getAllPaymentLogs,
  getPaymentActionStatistics,
  getUserPaymentActivity,
  getPaymentTimeline,
  getDailyPaymentActivities,
  getGatewayResponseAnalysis,
  getMostActivePaymentProcessors,
  getPaymentStatusFlow,
  cleanOldPaymentLogs,
  logPaymentCreation,
  logPaymentProcessing,
  logPaymentRefund,
  getPaymentLogSummary
};
