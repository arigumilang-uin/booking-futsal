const pool = require('../config/db');

const getAllPayments = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.method, p.provider,
           p.amount, p.admin_fee, p.total_amount, p.status, p.external_id,
           p.payment_url, p.expires_at, p.processed_by, p.verified_by,
           p.paid_at, p.failed_at, p.refunded_at, p.refund_amount,
           p.gateway_response, p.notes, p.created_at, p.updated_at,
           b.booking_number, b.name as customer_name, b.phone as customer_phone,
           b.date as booking_date, b.start_time, b.end_time,
           f.name as field_name, f.location as field_location,
           pb.name as processed_by_name, pb.employee_id as processed_by_employee_id,
           vb.name as verified_by_name, vb.employee_id as verified_by_employee_id
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN fields f ON b.field_id = f.id
    LEFT JOIN users pb ON p.processed_by = pb.id
    LEFT JOIN users vb ON p.verified_by = vb.id
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

const getPaymentById = async (id) => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.method, p.provider,
           p.amount, p.admin_fee, p.total_amount, p.status, p.external_id,
           p.payment_url, p.expires_at, p.processed_by, p.verified_by,
           p.paid_at, p.failed_at, p.refunded_at, p.refund_amount,
           p.gateway_response, p.notes, p.created_at, p.updated_at,
           b.booking_number, b.name as customer_name, b.phone as customer_phone,
           b.email as customer_email, b.date as booking_date, b.start_time, b.end_time,
           b.total_amount as booking_total_amount,
           f.name as field_name, f.location as field_location, f.image_url as field_image,
           pb.name as processed_by_name, pb.employee_id as processed_by_employee_id,
           vb.name as verified_by_name, vb.employee_id as verified_by_employee_id
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN fields f ON b.field_id = f.id
    LEFT JOIN users pb ON p.processed_by = pb.id
    LEFT JOIN users vb ON p.verified_by = vb.id
    WHERE p.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getPaymentsByBookingId = async (booking_id) => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.method, p.provider,
           p.amount, p.admin_fee, p.total_amount, p.status, p.external_id,
           p.payment_url, p.expires_at, p.processed_by, p.verified_by,
           p.paid_at, p.failed_at, p.refunded_at, p.refund_amount,
           p.gateway_response, p.notes, p.created_at, p.updated_at,
           pb.name as processed_by_name, pb.employee_id as processed_by_employee_id,
           vb.name as verified_by_name, vb.employee_id as verified_by_employee_id
    FROM payments p
    LEFT JOIN users pb ON p.processed_by = pb.id
    LEFT JOIN users vb ON p.verified_by = vb.id
    WHERE p.booking_id = $1
    ORDER BY p.created_at DESC
  `;
  const result = await pool.query(query, [booking_id]);
  return result.rows;
};

const createPayment = async (paymentData) => {
  const {
    booking_id, method, provider, amount, admin_fee = 0, status = 'pending',
    external_id, payment_url, expires_at, gateway_response, notes, created_by
  } = paymentData;

  const query = `
    INSERT INTO payments (
      booking_id, method, provider, amount, admin_fee, status, external_id,
      payment_url, expires_at, gateway_response, notes, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id, uuid, payment_number, booking_id, method, provider, amount,
              admin_fee, total_amount, status, external_id, payment_url,
              expires_at, created_at
  `;
  const values = [
    booking_id, method, provider, amount, admin_fee, status, external_id,
    payment_url, expires_at, gateway_response ? JSON.stringify(gateway_response) : null,
    notes, created_by
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const updatePaymentStatus = async (id, status, updatedBy = null, additionalData = {}) => {
  const {
    paid_at, failed_at, refunded_at, refund_amount, gateway_response, notes
  } = additionalData;

  let query, values;

  if (status === 'paid') {
    query = `
      UPDATE payments
      SET status = $1, paid_at = COALESCE($2, NOW()), processed_by = $3,
          gateway_response = COALESCE($4, gateway_response),
          notes = COALESCE($5, notes), updated_at = NOW()
      WHERE id = $6
      RETURNING id, uuid, payment_number, status, paid_at, total_amount
    `;
    values = [
      status, paid_at, updatedBy,
      gateway_response ? JSON.stringify(gateway_response) : null,
      notes, id
    ];
  } else if (status === 'failed') {
    query = `
      UPDATE payments
      SET status = $1, failed_at = COALESCE($2, NOW()), processed_by = $3,
          gateway_response = COALESCE($4, gateway_response),
          notes = COALESCE($5, notes), updated_at = NOW()
      WHERE id = $6
      RETURNING id, uuid, payment_number, status, failed_at
    `;
    values = [
      status, failed_at, updatedBy,
      gateway_response ? JSON.stringify(gateway_response) : null,
      notes, id
    ];
  } else if (status === 'refunded') {
    query = `
      UPDATE payments
      SET status = $1, refunded_at = COALESCE($2, NOW()), refund_amount = $3,
          verified_by = $4, gateway_response = COALESCE($5, gateway_response),
          notes = COALESCE($6, notes), updated_at = NOW()
      WHERE id = $7
      RETURNING id, uuid, payment_number, status, refunded_at, refund_amount
    `;
    values = [
      status, refunded_at, refund_amount, updatedBy,
      gateway_response ? JSON.stringify(gateway_response) : null,
      notes, id
    ];
  } else {
    query = `
      UPDATE payments
      SET status = $1, processed_by = $2,
          gateway_response = COALESCE($3, gateway_response),
          notes = COALESCE($4, notes), updated_at = NOW()
      WHERE id = $5
      RETURNING id, uuid, payment_number, status, updated_at
    `;
    values = [
      status, updatedBy,
      gateway_response ? JSON.stringify(gateway_response) : null,
      notes, id
    ];
  }

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deletePayment = async (id) => {
  const query = `
    UPDATE payments
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = $1
    RETURNING id, uuid, payment_number, status
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getPaymentsByStatus = async (status) => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.method, p.provider,
           p.amount, p.admin_fee, p.total_amount, p.status, p.external_id,
           p.paid_at, p.failed_at, p.refunded_at, p.created_at,
           b.booking_number, b.name as customer_name, b.phone as customer_phone,
           b.date as booking_date, b.start_time, b.end_time,
           f.name as field_name, f.location as field_location
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE p.status = $1
    ORDER BY p.created_at DESC
  `;
  const result = await pool.query(query, [status]);
  return result.rows;
};

const getPaymentsByMethod = async (method) => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.method, p.provider,
           p.amount, p.admin_fee, p.total_amount, p.status, p.external_id,
           p.paid_at, p.created_at,
           b.booking_number, b.name as customer_name, b.phone as customer_phone,
           b.date as booking_date, f.name as field_name
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE p.method = $1
    ORDER BY p.created_at DESC
  `;
  const result = await pool.query(query, [method]);
  return result.rows;
};

// Get pending payments
const getPendingPayments = async () => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.method, p.provider,
           p.amount, p.admin_fee, p.total_amount, p.status, p.external_id,
           p.payment_url, p.expires_at, p.created_at,
           b.booking_number, b.name as customer_name, b.phone as customer_phone,
           b.date as booking_date, b.start_time, b.end_time,
           f.name as field_name, f.location as field_location
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get expired payments
const getExpiredPayments = async () => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.method, p.provider,
           p.amount, p.admin_fee, p.total_amount, p.status, p.external_id,
           p.expires_at, p.created_at,
           b.booking_number, b.name as customer_name, b.phone as customer_phone,
           b.date as booking_date, f.name as field_name
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE p.status = 'pending'
      AND p.expires_at IS NOT NULL
      AND p.expires_at < NOW()
    ORDER BY p.expires_at ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const updatePaymentByExternalId = async (external_id, status, gatewayResponse) => {
  const query = `
    UPDATE payments
    SET status = $1,
        paid_at = CASE WHEN $1 = 'paid' THEN NOW() ELSE paid_at END,
        failed_at = CASE WHEN $1 = 'failed' THEN NOW() ELSE failed_at END,
        gateway_response = $2,
        updated_at = NOW()
    WHERE external_id = $3
    RETURNING id, uuid, payment_number, booking_id, status, total_amount
  `;
  const result = await pool.query(query, [
    status,
    JSON.stringify(gatewayResponse),
    external_id
  ]);
  return result.rows[0];
};

// Get payment statistics
const getPaymentStatistics = async (startDate, endDate) => {
  const query = `
    SELECT
      COUNT(*) as total_payments,
      COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_payments,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue,
      COALESCE(AVG(CASE WHEN status = 'paid' THEN total_amount ELSE NULL END), 0) as avg_payment_amount
    FROM payments
    WHERE created_at BETWEEN $1 AND $2
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows[0];
};

const getPaymentsByDateRange = async (startDate, endDate) => {
  const query = `
    SELECT p.id, p.uuid, p.payment_number, p.booking_id, p.method, p.provider,
           p.amount, p.admin_fee, p.total_amount, p.status, p.external_id,
           p.paid_at, p.created_at,
           b.booking_number, b.name as customer_name, b.phone as customer_phone,
           b.date as booking_date, f.name as field_name
    FROM payments p
    LEFT JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN fields f ON b.field_id = f.id
    WHERE p.created_at BETWEEN $1 AND $2
    ORDER BY p.created_at DESC
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

// Get payment method breakdown for a specific date
const getPaymentMethodBreakdown = async (date) => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const query = `
    SELECT
      method,
      COUNT(*) as transaction_count,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as total_amount,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN admin_fee ELSE 0 END), 0) as total_admin_fee
    FROM payments
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY method
    ORDER BY total_amount DESC
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

// Get daily cash summary
const getDailyCashSummary = async (date) => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const query = `
    SELECT
      COUNT(*) as total_transactions,
      COUNT(CASE WHEN status = 'paid' THEN 1 END) as successful_transactions,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as gross_revenue,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN admin_fee ELSE 0 END), 0) as total_admin_fees,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as net_revenue,
      COALESCE(SUM(CASE WHEN status = 'paid' AND method = 'cash' THEN total_amount ELSE 0 END), 0) as cash_revenue,
      COALESCE(SUM(CASE WHEN status = 'paid' AND method != 'cash' THEN total_amount ELSE 0 END), 0) as digital_revenue
    FROM payments
    WHERE created_at BETWEEN $1 AND $2
  `;
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows[0];
};

// Process payment method (business logic for payment processing)
const processPaymentMethod = async (paymentData) => {
  const { method, amount, booking_id, customer_info } = paymentData;

  try {
    // Calculate admin fee based on method
    let admin_fee = 0;
    let provider = null;

    switch (method) {
      case 'cash':
        admin_fee = 0;
        provider = 'manual';
        break;
      case 'bank_transfer':
        admin_fee = Math.max(amount * 0.01, 2500); // 1% min 2500
        provider = 'manual';
        break;
      case 'e_wallet':
        admin_fee = amount * 0.015; // 1.5%
        provider = 'xendit';
        break;
      case 'credit_card':
        admin_fee = amount * 0.029 + 2000; // 2.9% + 2000
        provider = 'xendit';
        break;
      default:
        throw new Error('Unsupported payment method');
    }

    const total_amount = amount + admin_fee;

    const payment_number = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const external_id = `booking-${booking_id}-${Date.now()}`;
    const expires_at = method === 'cash' ? null : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const processedPayment = {
      payment_number,
      booking_id,
      method,
      provider,
      amount,
      admin_fee,
      total_amount,
      external_id,
      expires_at,
      status: method === 'cash' ? 'paid' : 'pending',
      paid_at: method === 'cash' ? new Date() : null,
      customer_info: JSON.stringify(customer_info)
    };

    return processedPayment;
  } catch (error) {
    console.error('Process payment method error:', error);
    throw error;
  }
};

// Get advanced payment analytics
const getAdvancedPaymentAnalytics = async (dateRange, type = 'daily') => {
  let groupBy = '';
  let dateFormat = '';

  switch (type) {
    case 'hourly':
      groupBy = 'DATE_TRUNC(\'hour\', created_at)';
      dateFormat = 'YYYY-MM-DD HH24:00';
      break;
    case 'daily':
      groupBy = 'DATE_TRUNC(\'day\', created_at)';
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'weekly':
      groupBy = 'DATE_TRUNC(\'week\', created_at)';
      dateFormat = 'YYYY-"W"WW';
      break;
    case 'monthly':
      groupBy = 'DATE_TRUNC(\'month\', created_at)';
      dateFormat = 'YYYY-MM';
      break;
    default:
      groupBy = 'DATE_TRUNC(\'day\', created_at)';
      dateFormat = 'YYYY-MM-DD';
  }

  const query = `
    SELECT
      TO_CHAR(${groupBy}, '${dateFormat}') as period,
      COUNT(*) as total_transactions,
      COUNT(CASE WHEN status = 'paid' THEN 1 END) as successful_transactions,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue,
      COALESCE(AVG(CASE WHEN status = 'paid' THEN total_amount ELSE NULL END), 0) as avg_transaction_value,
      COUNT(DISTINCT CASE WHEN status = 'paid' THEN booking_id END) as unique_bookings
    FROM payments
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY ${groupBy}
    ORDER BY ${groupBy}
  `;
  const result = await pool.query(query, [dateRange.start, dateRange.end]);
  return result.rows;
};

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsByBookingId,
  createPayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentsByStatus,
  getPaymentsByMethod,
  getPendingPayments,
  getExpiredPayments,
  updatePaymentByExternalId,
  getPaymentStatistics,
  getPaymentsByDateRange,
  getPaymentMethodBreakdown,
  getDailyCashSummary,
  processPaymentMethod,
  getAdvancedPaymentAnalytics,
};