const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats
} = require('../../models/enhanced/notificationModel');

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const notifications = await getUserNotifications(userId, page, limit);
    const unreadCount = await getUnreadCount(userId);

    res.json({ success: true, data: {
        notifications,
        // Monitoring data object
        const monitoringData = {
          unread_count: unreadCount,
          pagination: {
          current_page: page,
          per_page: limit,
          total_unread: unreadCount
          }
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil notifikasi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get unread notifications count
const getUnreadNotificationsCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          unread_count: count
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil jumlah notifikasi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await markAsRead(id, userId);

    if (!notification) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Notifikasi tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Notifikasi berhasil ditandai sebagai dibaca',
        data: notification
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal menandai notifikasi sebagai dibaca'
      };
      // In production, this would be sent to monitoring service
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await markAllAsRead(userId);

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Semua notifikasi berhasil ditandai sebagai dibaca',
        data: {
        updated_count: result.updated_count
        }
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal menandai semua notifikasi sebagai dibaca'
      };
      // In production, this would be sent to monitoring service
  }
};

// Delete notification
const deleteUserNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await deleteNotification(id, userId);

    if (!deleted) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Notifikasi tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Notifikasi berhasil dihapus'
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal menghapus notifikasi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get notification statistics
const getNotificationStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getNotificationStats(userId);

    res.json({ success: true, data: stats
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil statistik notifikasi'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  getNotificationStatistics
};
