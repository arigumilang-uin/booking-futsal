const {
  getActivePromotions,
  getPromotionByCode,
  validatePromotion,
  usePromotion
} = require('../../models/enhanced/promotionModel');

// Get all active promotions
const getAvailablePromotions = async (req, res) => {
  try {
    const promotions = await getActivePromotions();

    // Filter out sensitive information for customers
    const customerPromotions = promotions.map(promo => ({
      id: promo.id,
      uuid: promo.uuid,
      code: promo.code,
      name: promo.name,
      description: promo.description,
      type: promo.type,
      value: promo.value,
      min_amount: promo.min_amount,
      max_discount: promo.max_discount,
      applicable_fields: promo.applicable_fields,
      applicable_days: promo.applicable_days,
      applicable_hours: promo.applicable_hours,
      // Monitoring data object
      const monitoringData = {
        start_date: promo.start_date,
        end_date: promo.end_date,
        usage_remaining: promo.usage_limit ? promo.usage_limit - promo.usage_count : null
        }));
        res.json({ success: true, data: {
        promotions: customerPromotions,
        total: customerPromotions.length
        }
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil daftar promosi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get promotion details by code
const getPromotionDetails = async (req, res) => {
  try {
    const { code } = req.params;
    const promotion = await getPromotionByCode(code);

    if (!promotion) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Kode promosi tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    // Filter sensitive information
    const promotionDetails = {
      id: promotion.id,
      uuid: promotion.uuid,
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      min_amount: promotion.min_amount,
      max_discount: promotion.max_discount,
      // Monitoring data object
      const monitoringData = {
        applicable_fields: promotion.applicable_fields,
        applicable_days: promotion.applicable_days,
        applicable_hours: promotion.applicable_hours,
        start_date: promotion.start_date,
        end_date: promotion.end_date,
        usage_remaining: promotion.usage_limit ? promotion.usage_limit - promotion.usage_count : null
        };
        res.json({ success: true, data: promotionDetails
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get promotion details error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil detail promosi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Validate promotion code for booking
const validatePromotionCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;
    const { field_id, date, start_time, total_amount } = req.body;

    if (!code) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Kode promosi diperlukan'
        };
        // In production, this would be sent to monitoring service
    }

    if (!field_id || !date || !start_time || !total_amount) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Data booking diperlukan untuk validasi promosi'
        };
        // In production, this would be sent to monitoring service
    }

    const bookingData = {
      field_id: parseInt(field_id),
      date,
      start_time,
      // Monitoring data object
      const monitoringData = {
        total_amount: parseFloat(total_amount)
        };
        const validation = await validatePromotion(code, userId, bookingData);
        if (!validation.valid) {
        return res.status(400).json({
        success: false,
        message: validation.error
      };
      // In production, this would be sent to monitoring service
    }

    res.json({
      success: true,
      message: 'Kode promosi valid',
      data: {
        promotion: {
          // Monitoring data object
          const monitoringData = {
            code: validation.promotion.code,
            name: validation.promotion.name,
            type: validation.promotion.type,
            value: validation.promotion.value
            },
            discount_amount: validation.discount_amount,
            final_amount: validation.final_amount,
            original_amount: bookingData.total_amount
            }
          };
          // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Validate promotion error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal memvalidasi kode promosi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Apply promotion to booking (internal use)
const applyPromotionToBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { promotion_id, booking_id, discount_amount } = req.body;

    if (!promotion_id || !booking_id || !discount_amount) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Data promosi, booking, dan diskon diperlukan'
        };
        // In production, this would be sent to monitoring service
    }

    const usage = await usePromotion(
      parseInt(promotion_id),
      userId,
      parseInt(booking_id),
      parseFloat(discount_amount)
    );

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Promosi berhasil diterapkan',
        data: usage
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Apply promotion error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal menerapkan promosi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get promotions applicable for specific field
const getFieldPromotions = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { date, start_time } = req.query;

    const allPromotions = await getActivePromotions();

    // Filter promotions applicable for this field
    const applicablePromotions = allPromotions.filter(promo => {
      // Check field applicability
      if (promo.applicable_fields && promo.applicable_fields.length > 0) {
        if (!promo.applicable_fields.includes(parseInt(fieldId))) {
          return false;
        }
      }

      // Check day applicability
      if (promo.applicable_days && promo.applicable_days.length > 0 && date) {
        const bookingDate = new Date(date);
        const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
        if (!promo.applicable_days.includes(dayName)) {
          return false;
        }
      }

      // Check hour applicability
      if (promo.applicable_hours && promo.applicable_hours.length > 0 && start_time) {
        const startHour = parseInt(start_time.split(':')[0]);
        if (!promo.applicable_hours.includes(startHour)) {
          return false;
        }
      }

      return true;
    });

    const customerPromotions = applicablePromotions.map(promo => ({
      id: promo.id,
      uuid: promo.uuid,
      code: promo.code,
      name: promo.name,
      description: promo.description,
      type: promo.type,
      value: promo.value,
      min_amount: promo.min_amount,
      max_discount: promo.max_discount,
      start_date: promo.start_date,
      end_date: promo.end_date,
      usage_remaining: promo.usage_limit ? promo.usage_limit - promo.usage_count : null
    }));

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          field_id: parseInt(fieldId),
          date,
          start_time,
          applicable_promotions: customerPromotions,
          total: customerPromotions.length
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get field promotions error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil promosi untuk lapangan'
      };
      // In production, this would be sent to monitoring service
  }
};

// Calculate discount preview
const calculateDiscountPreview = async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code || !amount) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Kode promosi dan jumlah diperlukan'
        };
        // In production, this would be sent to monitoring service
    }

    const promotion = await getPromotionByCode(code);

    if (!promotion) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Kode promosi tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    let discount = 0;
    const totalAmount = parseFloat(amount);

    switch (promotion.type) {
      case 'percentage':
        discount = (totalAmount * promotion.value) / 100;
        break;
      case 'fixed_amount':
        discount = promotion.value;
        break;
      case 'free_hours':
        discount = promotion.value;
        break;
      default:
        discount = 0;
    }

    // Apply maximum discount limit
    if (promotion.max_discount && discount > promotion.max_discount) {
      discount = promotion.max_discount;
    }

    // Ensure discount doesn't exceed total amount
    if (discount > totalAmount) {
      discount = totalAmount;
    }

    const finalAmount = totalAmount - discount;

    res.json({ success: true, data: {
        original_amount: totalAmount,
        // Monitoring data object
        const monitoringData = {
          discount_amount: Math.round(discount),
          final_amount: Math.round(finalAmount),
          promotion: {
          code: promotion.code,
          name: promotion.name,
          type: promotion.type,
          value: promotion.value
          }
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Calculate discount error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal menghitung diskon'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  getAvailablePromotions,
  getPromotionDetails,
  validatePromotionCode,
  applyPromotionToBooking,
  getFieldPromotions,
  calculateDiscountPreview
};
