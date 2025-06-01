const {
  createNotification,
  broadcastNotification,
  createSystemNotification,
  getNotificationStats
} = require('../../models/enhanced/notificationModel');

const pool = require('../../config/db');

// Get all notifications with filters (admin view)
const getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let values = [];
    let paramCount = 1;

    // Build dynamic filters
    if (req.query.user_id) {
      whereConditions.push(`n.user_id = $${paramCount++}`);
      values.push(parseInt(req.query.user_id));
    }

    if (req.query.type) {
      whereConditions.push(`n.type = $${paramCount++}`);
      values.push(req.query.type);
    }

    if (req.query.priority) {
      whereConditions.push(`n.priority = $${paramCount++}`);
      values.push(req.query.priority);
    }

    if (req.query.read_status) {
      if (req.query.read_status === 'read') {
        whereConditions.push(`n.read_at IS NOT NULL`);
      } else if (req.query.read_status === 'unread') {
        whereConditions.push(`n.read_at IS NULL`);
      }
    }

    if (req.query.date_from) {
      whereConditions.push(`n.created_at >= $${paramCount++}`);
      values.push(req.query.date_from);
    }

    if (req.query.date_to) {
      whereConditions.push(`n.created_at <= $${paramCount++}`);
      values.push(req.query.date_to);
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        n.id, n.uuid, n.user_id, n.type, n.title, n.message, n.data,
        n.channels, n.priority, n.read_at, n.sent_at, n.failed_at,
        n.error_message, n.created_at,
        u.name as user_name, u.email as user_email, u.role as user_role
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;

    values.push(limit, offset);
    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        pagination: {
          current_page: page,
          per_page: limit,
          total: result.rows.length
        }
      }
    });
  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar notifikasi'
    });
  }
};

// Create system notification
const createSystemNotificationAdmin = async (req, res) => {
  try {
    const { user_id, title, message, data, channels, priority } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, judul, dan pesan diperlukan'
      });
    }

    const notification = await createNotification({
      user_id: parseInt(user_id),
      type: 'system',
      title,
      message,
      data: data || {},
      channels: channels || ['app'],
      priority: priority || 'normal'
    });

    res.status(201).json({
      success: true,
      message: 'Notifikasi sistem berhasil dibuat',
      data: notification
    });
  } catch (error) {
    console.error('Create system notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat notifikasi sistem'
    });
  }
};

// Broadcast notification to multiple users
const broadcastNotificationAdmin = async (req, res) => {
  try {
    const { user_ids, title, message, data, channels, priority, user_filter } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Judul dan pesan diperlukan'
      });
    }

    let targetUserIds = [];

    if (user_ids && Array.isArray(user_ids)) {
      targetUserIds = user_ids;
    } else if (user_filter) {
      // Get users based on filter criteria
      let userQuery = 'SELECT id FROM users WHERE is_active = true';
      let userValues = [];
      let paramCount = 1;

      if (user_filter.role) {
        userQuery += ` AND role = $${paramCount++}`;
        userValues.push(user_filter.role);
      }

      if (user_filter.last_login_days) {
        userQuery += ` AND last_login_at >= CURRENT_DATE - INTERVAL '${user_filter.last_login_days} days'`;
      }

      const userResult = await pool.query(userQuery, userValues);
      targetUserIds = userResult.rows.map(row => row.id);
    } else {
      return res.status(400).json({
        success: false,
        message: 'User IDs atau filter pengguna diperlukan'
      });
    }

    if (targetUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada pengguna yang memenuhi kriteria'
      });
    }

    const notificationData = {
      type: 'system',
      title,
      message,
      data: data || {},
      channels: channels || ['app'],
      priority: priority || 'normal'
    };

    const notifications = await broadcastNotification(targetUserIds, notificationData);

    res.status(201).json({
      success: true,
      message: `Notifikasi berhasil dikirim ke ${notifications.length} pengguna`,
      data: {
        sent_count: notifications.length,
        target_users: targetUserIds.length,
        notifications: notifications.slice(0, 5) // Show first 5 for preview
      }
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengirim broadcast notifikasi'
    });
  }
};

// Get notification statistics
const getNotificationStatistics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    // Get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END) as read_count,
        COUNT(CASE WHEN read_at IS NULL THEN 1 END) as unread_count,
        COUNT(CASE WHEN type = 'booking' THEN 1 END) as booking_notifications,
        COUNT(CASE WHEN type = 'payment' THEN 1 END) as payment_notifications,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system_notifications,
        COUNT(CASE WHEN type = 'promotion' THEN 1 END) as promotion_notifications,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_notifications,
        COUNT(CASE WHEN failed_at IS NOT NULL THEN 1 END) as failed_notifications,
        COUNT(DISTINCT user_id) as unique_recipients
      FROM notifications
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
    `;

    const statsResult = await pool.query(statsQuery);

    // Get daily statistics
    const dailyStatsQuery = `
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END) as read,
        COUNT(CASE WHEN read_at IS NULL THEN 1 END) as unread
      FROM notifications
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `;

    const dailyStatsResult = await pool.query(dailyStatsQuery);

    res.json({
      success: true,
      data: {
        period_days: days,
        overall_stats: statsResult.rows[0],
        daily_stats: dailyStatsResult.rows
      }
    });
  } catch (error) {
    console.error('Get notification statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik notifikasi'
    });
  }
};

// Get notification delivery status
const getNotificationDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        n.id, n.uuid, n.title, n.message, n.channels, n.priority,
        n.read_at, n.sent_at, n.failed_at, n.error_message, n.created_at,
        u.name as user_name, u.email as user_email
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.id = $1
    `;

    const result = await pool.query(query, [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan'
      });
    }

    const notification = result.rows[0];

    // Determine delivery status
    let delivery_status = 'pending';
    if (notification.failed_at) {
      delivery_status = 'failed';
    } else if (notification.read_at) {
      delivery_status = 'read';
    } else if (notification.sent_at) {
      delivery_status = 'delivered';
    }

    res.json({
      success: true,
      data: {
        ...notification,
        delivery_status
      }
    });
  } catch (error) {
    console.error('Get notification delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil status pengiriman notifikasi'
    });
  }
};

// Delete notification (admin)
const deleteNotificationAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM notifications
      WHERE id = $1
      RETURNING id, title
    `;

    const result = await pool.query(query, [parseInt(id)]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Notifikasi berhasil dihapus',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus notifikasi'
    });
  }
};

// Get user notification summary
const getUserNotificationSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await getNotificationStats(parseInt(userId));

    res.json({
      success: true,
      data: {
        user_id: parseInt(userId),
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Get user notification summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan notifikasi pengguna'
    });
  }
};

module.exports = {
  getAllNotifications,
  createSystemNotificationAdmin,
  broadcastNotificationAdmin,
  getNotificationStatistics,
  getNotificationDeliveryStatus,
  deleteNotificationAdmin,
  getUserNotificationSummary
};
