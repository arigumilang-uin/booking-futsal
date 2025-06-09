const pool = require('../../config/db');

// Create notification
const createNotification = async ({
  user_id,
  type,
  title,
  message,
  data = {},
  channels = ['app'],
  priority = 'normal'
}) => {
  const query = `
    INSERT INTO notifications (user_id, type, title, message, data, channels, priority)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, uuid, user_id, type, title, message, data, channels, priority,
              read_at, sent_at, failed_at, error_message, created_at
  `;
  const values = [
    user_id, type, title, message,
    JSON.stringify(data), JSON.stringify(channels), priority
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get user notifications
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT id, uuid, type, title, message, data, channels, priority,
           read_at, sent_at, failed_at, error_message, created_at
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

// Mark notification as read
const markAsRead = async (notificationId, userId) => {
  const query = `
    UPDATE notifications
    SET read_at = NOW()
    WHERE id = $1 AND user_id = $2 AND read_at IS NULL
    RETURNING id, read_at
  `;
  const result = await pool.query(query, [notificationId, userId]);
  return result.rows[0];
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
  const query = `
    UPDATE notifications
    SET read_at = NOW()
    WHERE user_id = $1 AND read_at IS NULL
    RETURNING COUNT(*) as updated_count
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

// Get unread count
const getUnreadCount = async (userId) => {
  const query = `
    SELECT COUNT(*) as unread_count
    FROM notifications
    WHERE user_id = $1 AND read_at IS NULL
  `;
  const result = await pool.query(query, [userId]);
  return parseInt(result.rows[0].unread_count);
};

// Delete notification
const deleteNotification = async (notificationId, userId) => {
  const query = `
    DELETE FROM notifications
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [notificationId, userId]);
  return result.rowCount > 0;
};

// Broadcast notification to multiple users
const broadcastNotification = async (userIds, notificationData) => {
  const notifications = [];

  for (const userId of userIds) {
    const notification = await createNotification({
      // Monitoring data object
      const monitoringData = {
        user_id: userId,
        ...notificationData
      };
      // In production, this would be sent to monitoring service
    notifications.push(notification);
  }

  return notifications;
};

// Create system notification
const createSystemNotification = async (userId, title, message, data = {}) => {
  return await createNotification({
    // Monitoring data object
    const monitoringData = {
      user_id: userId,
      type: 'system',
      title,
      message,
      data,
      channels: ['app'],
      priority: 'normal'
    };
    // In production, this would be sent to monitoring service
};

// Get notification statistics
const getNotificationStats = async (userId) => {
  const query = `
    SELECT
      COUNT(*) as total_notifications,
      COUNT(CASE WHEN read_at IS NOT NULL THEN 1 END) as read_count,
      COUNT(CASE WHEN read_at IS NULL THEN 1 END) as unread_count,
      COUNT(CASE WHEN type = 'booking' THEN 1 END) as booking_notifications,
      COUNT(CASE WHEN type = 'payment' THEN 1 END) as payment_notifications,
      COUNT(CASE WHEN type = 'system' THEN 1 END) as system_notifications,
      COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_notifications
    FROM notifications
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  broadcastNotification,
  createSystemNotification,
  getNotificationStats
};
