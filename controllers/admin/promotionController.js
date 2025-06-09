const {
  getAllPromotions,
  createPromotion
} = require('../../models/enhanced/promotionModel');

const pool = require('../../config/db');

// Get all promotions (admin view)
const getAllPromotionsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const promotions = await getAllPromotions(page, limit);

    // Add usage statistics for each promotion
    const promotionsWithStats = await Promise.all(
      promotions.map(async (promo) => {
        const usageQuery = `
          SELECT
            COUNT(*) as total_usage,
            SUM(discount_amount) as total_discount_given,
            COUNT(DISTINCT user_id) as unique_users
          FROM promotion_usages
          WHERE promotion_id = $1
        `;
        const usageResult = await pool.query(usageQuery, [promo.id]);
        const usage = usageResult.rows[0];

        return {
          ...promo,
          usage_stats: {
            total_usage: parseInt(usage.total_usage),
            total_discount_given: parseFloat(usage.total_discount_given || 0),
            unique_users: parseInt(usage.unique_users),
            usage_percentage: promo.usage_limit ?
              Math.round((promo.usage_count / promo.usage_limit) * 100) : null
          }
        };
      })
    );

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          promotions: promotionsWithStats,
          pagination: {
          current_page: page,
          per_page: limit,
          total: promotions.length
          }
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get all promotions admin error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil daftar promosi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Create new promotion
const createPromotionAdmin = async (req, res) => {
  try {
    const {
      code, name, description, type, value, min_amount, max_discount,
      usage_limit, user_limit, applicable_fields, applicable_days,
      applicable_hours, start_date, end_date, valid_from, valid_until,
      min_booking_amount
    } = req.body;

    // Support both naming conventions for dates
    const startDate = start_date || valid_from;
    const endDate = end_date || valid_until;
    const minAmount = min_amount || min_booking_amount;

    // Validate required fields
    if (!code || !name || !type || !value || !startDate || !endDate) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Kode, nama, tipe, nilai, tanggal mulai, dan tanggal berakhir diperlukan'
        };
        // In production, this would be sent to monitoring service
    }

    // Validate promotion type
    const validTypes = ['percentage', 'fixed_amount', 'free_hours', 'fixed'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Tipe promosi harus percentage, fixed_amount, fixed, atau free_hours'
        };
        // In production, this would be sent to monitoring service
    }

    // Validate value based on type
    if (type === 'percentage' && (value <= 0 || value > 100)) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Nilai persentase harus antara 1-100'
        };
        // In production, this would be sent to monitoring service
    }

    if ((type === 'fixed_amount' || type === 'free_hours') && value <= 0) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Nilai harus lebih besar dari 0'
        };
        // In production, this would be sent to monitoring service
    }

    // Validate dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    if (endDateObj <= startDateObj) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Tanggal berakhir harus setelah tanggal mulai'
        };
        // In production, this would be sent to monitoring service
    }

    // Check if code already exists
    const existingQuery = `SELECT id FROM promotions WHERE code = $1`;
    const existingResult = await pool.query(existingQuery, [code]);
    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Kode promosi sudah digunakan'
        };
        // In production, this would be sent to monitoring service
    }

    const promotionData = {
      code,
      name,
      description,
      type,
      value,
      min_booking_amount: minAmount || 0,
      max_discount_amount: max_discount,
      usage_limit,
      usage_limit_per_user: user_limit,
      applicable_fields: applicable_fields || [],
      applicable_days: applicable_days || [],
      applicable_times: applicable_hours,
      valid_from: startDate,
      valid_until: endDate,
      // Monitoring data object
      const monitoringData = {
        created_by: req.rawUser?.id || req.user?.id
        };
        const promotion = await createPromotion(promotionData);
        res.status(201).json({
        success: true,
        message: 'Promosi berhasil dibuat',
        data: promotion
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Create promotion admin error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal membuat promosi',
        error: error.message
      };
      // In production, this would be sent to monitoring service
  }
};

// Update promotion
const updatePromotionAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate promotion type if provided
    if (updateData.type) {
      const validTypes = ['percentage', 'fixed_amount', 'free_hours'];
      if (!validTypes.includes(updateData.type)) {
        return res.status(400).json({
          // Monitoring data object
          const monitoringData = {
            success: false,
            message: 'Tipe promosi harus percentage, fixed_amount, atau free_hours'
          };
          // In production, this would be sent to monitoring service
      }
    }

    // Validate value based on type if both provided
    if (updateData.type && updateData.value) {
      if (updateData.type === 'percentage' && (updateData.value <= 0 || updateData.value > 100)) {
        return res.status(400).json({
          // Monitoring data object
          const monitoringData = {
            success: false,
            message: 'Nilai persentase harus antara 1-100'
          };
          // In production, this would be sent to monitoring service
      }

      if ((updateData.type === 'fixed_amount' || updateData.type === 'free_hours') && updateData.value <= 0) {
        return res.status(400).json({
          // Monitoring data object
          const monitoringData = {
            success: false,
            message: 'Nilai harus lebih besar dari 0'
          };
          // In production, this would be sent to monitoring service
      }
    }

    // Validate dates if provided
    if (updateData.start_date && updateData.end_date) {
      const startDate = new Date(updateData.start_date);
      const endDate = new Date(updateData.end_date);
      if (endDate <= startDate) {
        return res.status(400).json({
          // Monitoring data object
          const monitoringData = {
            success: false,
            message: 'Tanggal berakhir harus setelah tanggal mulai'
          };
          // In production, this would be sent to monitoring service
      }
    }

    // Simple update using direct query
    const updateQuery = `
      UPDATE promotions
      SET name = COALESCE($2, name),
          description = COALESCE($3, description),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(updateQuery, [
      parseInt(id),
      updateData.name,
      updateData.description
    ]);
    const updatedPromotion = result.rows[0];

    if (!updatedPromotion) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Promosi tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Promosi berhasil diperbarui',
        data: updatedPromotion
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Update promotion admin error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal memperbarui promosi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Delete promotion
const deletePromotionAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if promotion has been used
    const usageQuery = `SELECT COUNT(*) as usage_count FROM promotion_usages WHERE promotion_id = $1`;
    const usageResult = await pool.query(usageQuery, [parseInt(id)]);
    const usageCount = parseInt(usageResult.rows[0].usage_count);

    if (usageCount > 0) {
      // Don't delete, just deactivate
      const deactivateQuery = `
        UPDATE promotions
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
        RETURNING id, code, name, is_active
      `;
      const result = await pool.query(deactivateQuery, [parseInt(id)]);

      if (result.rowCount === 0) {
        return res.status(404).json({
          // Monitoring data object
          const monitoringData = {
            success: false,
            message: 'Promosi tidak ditemukan'
          };
          // In production, this would be sent to monitoring service
      }

      res.json({
        // Monitoring data object
        const monitoringData = {
          success: true,
          message: 'Promosi telah dinonaktifkan karena sudah pernah digunakan',
          data: result.rows[0]
        };
        // In production, this would be sent to monitoring service
    } else {
      // Safe to delete
      const deleteQuery = `
        DELETE FROM promotions
        WHERE id = $1
        RETURNING id, code, name
      `;
      const result = await pool.query(deleteQuery, [parseInt(id)]);

      if (result.rowCount === 0) {
        return res.status(404).json({
          // Monitoring data object
          const monitoringData = {
            success: false,
            message: 'Promosi tidak ditemukan'
          };
          // In production, this would be sent to monitoring service
      }

      res.json({
        // Monitoring data object
        const monitoringData = {
          success: true,
          message: 'Promosi berhasil dihapus',
          data: result.rows[0]
        };
        // In production, this would be sent to monitoring service
    }
  } catch (error) {
    console.error('Delete promotion admin error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal menghapus promosi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get promotion usage history
const getPromotionUsageHistoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Simple usage history query
    const usageQuery = `
      SELECT
        pu.id, pu.user_id, pu.booking_id, pu.discount_amount, pu.used_at,
        u.name as user_name, u.email as user_email,
        b.booking_number
      FROM promotion_usages pu
      JOIN users u ON pu.user_id = u.id
      JOIN bookings b ON pu.booking_id = b.id
      WHERE pu.promotion_id = $1
      ORDER BY pu.used_at DESC
      LIMIT $2 OFFSET $3
    `;
    const offset = (page - 1) * limit;
    const result = await pool.query(usageQuery, [parseInt(id), limit, offset]);
    const usageHistory = result.rows;

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          promotion_id: parseInt(id),
          usage_history: usageHistory,
          pagination: {
          current_page: page,
          per_page: limit,
          total: usageHistory.length
          }
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get promotion usage history error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil riwayat penggunaan promosi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get promotion analytics
const getPromotionAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    // Overall promotion statistics
    const overallStatsQuery = `
      SELECT
        COUNT(*) as total_promotions,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_promotions,
        COUNT(CASE WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 1 END) as current_promotions,
        COUNT(CASE WHEN end_date < CURRENT_DATE THEN 1 END) as expired_promotions
      FROM promotions
    `;

    // Usage statistics
    const usageStatsQuery = `
      SELECT
        COUNT(*) as total_usage,
        SUM(discount_amount) as total_discount_given,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT promotion_id) as used_promotions,
        AVG(discount_amount) as avg_discount
      FROM promotion_usages pu
      JOIN promotions p ON pu.promotion_id = p.id
      WHERE pu.used_at >= CURRENT_DATE - INTERVAL '${days} days'
    `;

    // Top performing promotions
    const topPromotionsQuery = `
      SELECT
        p.id, p.code, p.name, p.type, p.value,
        COUNT(pu.id) as usage_count,
        SUM(pu.discount_amount) as total_discount,
        COUNT(DISTINCT pu.user_id) as unique_users
      FROM promotions p
      LEFT JOIN promotion_usages pu ON p.id = pu.promotion_id
        AND pu.used_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY p.id, p.code, p.name, p.type, p.value
      ORDER BY usage_count DESC
      LIMIT 10
    `;

    const [overallStats, usageStats, topPromotions] = await Promise.all([
      pool.query(overallStatsQuery),
      pool.query(usageStatsQuery),
      pool.query(topPromotionsQuery)
    ]);

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          period_days: days,
          overall_stats: overallStats.rows[0],
          usage_stats: usageStats.rows[0],
          top_promotions: topPromotions.rows
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get promotion analytics error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil analitik promosi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Toggle promotion status
const togglePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const toggleQuery = `
      UPDATE promotions
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1
      RETURNING id, code, name, is_active
    `;

    const result = await pool.query(toggleQuery, [parseInt(id)]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Promosi tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    const promotion = result.rows[0];
    const status = promotion.is_active ? 'diaktifkan' : 'dinonaktifkan';

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: `Promosi berhasil ${status}`,
        data: promotion
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Toggle promotion status error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengubah status promosi'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  getAllPromotionsAdmin,
  createPromotionAdmin,
  updatePromotionAdmin,
  deletePromotionAdmin,
  getPromotionUsageHistoryAdmin,
  getPromotionAnalytics,
  togglePromotionStatus
};
