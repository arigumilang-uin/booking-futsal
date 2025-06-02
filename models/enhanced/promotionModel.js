const pool = require('../../config/db');

// Create promotion
const createPromotion = async ({
  name,
  description,
  code,
  type,
  value,
  min_booking_amount = 0,
  max_discount_amount = null,
  usage_limit = null,
  usage_limit_per_user = null,
  valid_from,
  valid_until,
  applicable_fields = [],
  applicable_days = [],
  applicable_times = null,
  is_active = true,
  created_by
}) => {
  const query = `
    INSERT INTO promotions (
      name, description, code, type, value, min_booking_amount, max_discount_amount,
      usage_limit, usage_limit_per_user, valid_from, valid_until, applicable_fields,
      applicable_days, applicable_times, is_active, created_by,
      start_date_old, end_date_old
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING id, uuid, name, description, code, type, value, min_booking_amount,
              max_discount_amount, usage_limit, usage_limit_per_user, valid_from,
              valid_until, applicable_fields, applicable_days, applicable_times,
              is_active, usage_count, created_at
  `;
  const values = [
    name, description, code, type, value, min_booking_amount, max_discount_amount,
    usage_limit, usage_limit_per_user, valid_from, valid_until,
    JSON.stringify(applicable_fields), JSON.stringify(applicable_days),
    applicable_times ? JSON.stringify(applicable_times) : null, is_active, created_by,
    valid_from, valid_until  // Fill start_date_old and end_date_old with same values
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get all promotions
const getAllPromotions = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT p.id, p.uuid, p.name, p.description, p.code, p.type, p.value,
           p.min_booking_amount, p.max_discount_amount, p.usage_limit,
           p.usage_limit_per_user, p.valid_from, p.valid_until, p.applicable_fields,
           p.applicable_days, p.applicable_times, p.is_active, p.usage_count,
           p.created_at, p.updated_at,
           u.name as created_by_name
    FROM promotions p
    LEFT JOIN users u ON p.created_by = u.id
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

// Get promotion by ID
const getPromotionById = async (id) => {
  const query = `
    SELECT p.id, p.uuid, p.name, p.description, p.code, p.type, p.value,
           p.min_booking_amount, p.max_discount_amount, p.usage_limit,
           p.usage_limit_per_user, p.valid_from, p.valid_until, p.applicable_fields,
           p.applicable_days, p.applicable_times, p.is_active, p.usage_count,
           p.created_at, p.updated_at,
           u.name as created_by_name
    FROM promotions p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Get promotion by code
const getPromotionByCode = async (code) => {
  const query = `
    SELECT p.id, p.uuid, p.name, p.description, p.code, p.type, p.value,
           p.min_booking_amount, p.max_discount_amount, p.usage_limit,
           p.usage_limit_per_user, p.valid_from, p.valid_until, p.applicable_fields,
           p.applicable_days, p.applicable_times, p.is_active, p.usage_count,
           p.created_at, p.updated_at
    FROM promotions p
    WHERE p.code = $1
  `;
  const result = await pool.query(query, [code]);
  return result.rows[0];
};

// Get active promotions
const getActivePromotions = async () => {
  const query = `
    SELECT p.id, p.uuid, p.name, p.description, p.code, p.type, p.value,
           p.min_booking_amount, p.max_discount_amount, p.usage_limit,
           p.usage_limit_per_user, p.valid_from, p.valid_until, p.applicable_fields,
           p.applicable_days, p.applicable_times, p.is_active, p.usage_count,
           p.created_at
    FROM promotions p
    WHERE p.is_active = true
      AND p.valid_from <= NOW()
      AND p.valid_until >= NOW()
      AND (p.usage_limit IS NULL OR p.usage_count < p.usage_limit)
    ORDER BY p.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Validate promotion for booking
const validatePromotion = async (code, userId, bookingData) => {
  const promotion = await getPromotionByCode(code);

  if (!promotion) {
    return { valid: false, error: 'Promotion code not found' };
  }

  // Check if promotion is active
  if (!promotion.is_active) {
    return { valid: false, error: 'Promotion is not active' };
  }

  // Check validity period
  const now = new Date();
  const validFrom = new Date(promotion.valid_from);
  const validUntil = new Date(promotion.valid_until);

  if (now < validFrom || now > validUntil) {
    return { valid: false, error: 'Promotion is not valid at this time' };
  }

  // Check usage limit
  if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
    return { valid: false, error: 'Promotion usage limit reached' };
  }

  // Check user usage limit
  if (promotion.usage_limit_per_user) {
    const userUsageQuery = `
      SELECT COUNT(*) as user_usage_count
      FROM promotion_usages
      WHERE promotion_id = $1 AND user_id = $2
    `;
    const userUsageResult = await pool.query(userUsageQuery, [promotion.id, userId]);
    const userUsageCount = parseInt(userUsageResult.rows[0].user_usage_count);

    if (userUsageCount >= promotion.usage_limit_per_user) {
      return { valid: false, error: 'User usage limit reached for this promotion' };
    }
  }

  // Check minimum booking amount
  if (bookingData.total_amount < promotion.min_booking_amount) {
    return {
      valid: false,
      error: `Minimum booking amount is ${promotion.min_booking_amount}`
    };
  }

  // Check applicable fields
  if (promotion.applicable_fields && promotion.applicable_fields.length > 0) {
    if (!promotion.applicable_fields.includes(bookingData.field_id)) {
      return { valid: false, error: 'Promotion not applicable to this field' };
    }
  }

  // Check applicable days
  if (promotion.applicable_days && promotion.applicable_days.length > 0) {
    const bookingDay = new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    if (!promotion.applicable_days.includes(bookingDay)) {
      return { valid: false, error: 'Promotion not applicable on this day' };
    }
  }

  // Check applicable times
  if (promotion.applicable_times) {
    const bookingTime = bookingData.start_time;
    const applicableTimes = promotion.applicable_times;

    if (applicableTimes.start && applicableTimes.end) {
      if (bookingTime < applicableTimes.start || bookingTime > applicableTimes.end) {
        return { valid: false, error: 'Promotion not applicable at this time' };
      }
    }
  }

  return { valid: true, promotion };
};

// Calculate discount amount
const calculateDiscount = (promotion, bookingAmount) => {
  let discountAmount = 0;

  if (promotion.type === 'percentage') {
    discountAmount = (bookingAmount * promotion.value) / 100;
  } else if (promotion.type === 'fixed') {
    discountAmount = promotion.value;
  }

  // Apply maximum discount limit
  if (promotion.max_discount_amount && discountAmount > promotion.max_discount_amount) {
    discountAmount = promotion.max_discount_amount;
  }

  // Ensure discount doesn't exceed booking amount
  if (discountAmount > bookingAmount) {
    discountAmount = bookingAmount;
  }

  return Math.round(discountAmount);
};

// Apply promotion to booking
const applyPromotionToBooking = async (promotionCode, userId, bookingData) => {
  const validation = await validatePromotion(promotionCode, userId, bookingData);

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const promotion = validation.promotion;
  const discountAmount = calculateDiscount(promotion, bookingData.total_amount);

  return {
    success: true,
    promotion: {
      id: promotion.id,
      name: promotion.name,
      code: promotion.code,
      type: promotion.type,
      value: promotion.value
    },
    discount_amount: discountAmount,
    final_amount: bookingData.total_amount - discountAmount
  };
};

// Record promotion usage
const recordPromotionUsage = async (promotionId, userId, bookingId, discountAmount) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert promotion usage record
    const usageQuery = `
      INSERT INTO promotion_usages (promotion_id, user_id, booking_id, discount_amount)
      VALUES ($1, $2, $3, $4)
      RETURNING id, uuid, promotion_id, user_id, booking_id, discount_amount, created_at
    `;
    const usageResult = await client.query(usageQuery, [promotionId, userId, bookingId, discountAmount]);

    // Update promotion usage count
    const updateQuery = `
      UPDATE promotions
      SET usage_count = usage_count + 1, updated_at = NOW()
      WHERE id = $1
      RETURNING usage_count
    `;
    await client.query(updateQuery, [promotionId]);

    await client.query('COMMIT');
    return usageResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  getPromotionByCode,
  getActivePromotions,
  validatePromotion,
  calculateDiscount,
  applyPromotionToBooking,
  recordPromotionUsage
};
