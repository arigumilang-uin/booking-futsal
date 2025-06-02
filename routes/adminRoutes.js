// routes/adminRoutes.js - Admin Routes untuk Management Access
const express = require('express');
const router = express.Router();

// Admin Controllers
const {
  getAllSystemSettings,
  getPublicSystemSettings,
  getSystemSetting,
  updateSystemSetting,
  createSystemSetting,
  deleteSystemSetting,
  getSettingsByCategory,
  bulkUpdateSystemSettings,
  initializeDefaults,
  getApplicationConfig,
  resetSettingToDefault
} = require('../controllers/admin/systemSettingsController');

const {
  getAllAuditLogs,
  getAuditLogDetail,
  getRecordAuditHistory,
  getAuditStatisticsData,
  getMostActiveUsersData,
  getUserActivityLogs,
  getTableActivityLogs,
  cleanOldAuditLogsData,
  exportAuditLogs
} = require('../controllers/admin/auditLogController');

const {
  getAllNotifications,
  createSystemNotificationAdmin,
  broadcastNotificationAdmin,
  getNotificationStatistics,
  getNotificationDeliveryStatus,
  deleteNotificationAdmin,
  getUserNotificationSummary
} = require('../controllers/admin/notificationController');

const {
  getAllPromotionsAdmin,
  createPromotionAdmin,
  updatePromotionAdmin,
  deletePromotionAdmin,
  getPromotionUsageHistoryAdmin,
  getPromotionAnalytics,
  togglePromotionStatus
} = require('../controllers/admin/promotionController');

const {
  getRoleManagementDashboard,
  getAllUsersForRoleManagement,
  requestRoleChange,
  changeUserRoleDirect
} = require('../controllers/admin/roleManagementController');

const {
  getBusinessAnalytics,
  getSystemAnalytics,
  getPerformanceMetrics
} = require('../controllers/shared/analyticsController');

const {
  triggerAutoCompletion,
  getEligibleBookings,
  getCompletionStats,
  manualCompleteBooking,
  getAutoCompletionConfig
} = require('../controllers/admin/autoCompletionController');

const {
  getAllBookingsAdmin,
  getBookingDetailAdmin,
  updateBookingStatusAdmin,
  getBookingStatisticsAdmin
} = require('../controllers/admin/bookingController');

// Middlewares
const { requireAuth } = require('../middlewares/auth/authMiddleware');
const { requireAdmin, requireManagement } = require('../middlewares/authorization/roleBasedAccess');

// Apply authentication to all admin routes
router.use(requireAuth);

// =====================================================
// SYSTEM SETTINGS ROUTES - ADMIN ONLY
// =====================================================

/**
 * @route   GET /api/admin/settings
 * @desc    Get all system settings
 * @access  Admin (supervisor_sistem only)
 */
router.get('/settings', requireAdmin, getAllSystemSettings);

/**
 * @route   GET /api/admin/settings/public
 * @desc    Get public system settings
 * @access  Management (manajer_futsal+)
 */
router.get('/settings/public', requireManagement, getPublicSystemSettings);

/**
 * @route   GET /api/admin/settings/:key
 * @desc    Get setting by key
 * @access  Admin (supervisor_sistem only)
 * @params  { key: setting_key }
 */
router.get('/settings/:key', requireAdmin, getSystemSetting);

/**
 * @route   PUT /api/admin/settings/:key
 * @desc    Update system setting
 * @access  Admin (supervisor_sistem only)
 * @params  { key: setting_key }
 * @body    { value, description, is_public }
 */
router.put('/settings/:key', requireAdmin, updateSystemSetting);

/**
 * @route   POST /api/admin/settings
 * @desc    Create new system setting
 * @access  Admin (supervisor_sistem only)
 * @body    { key, value, description, is_public }
 */
router.post('/settings', requireAdmin, createSystemSetting);

/**
 * @route   DELETE /api/admin/settings/:key
 * @desc    Delete system setting
 * @access  Admin (supervisor_sistem only)
 * @params  { key: setting_key }
 */
router.delete('/settings/:key', requireAdmin, deleteSystemSetting);

/**
 * @route   GET /api/admin/settings/category/:category
 * @desc    Get settings by category
 * @access  Admin (supervisor_sistem only)
 * @params  { category: setting_category }
 */
router.get('/settings/category/:category', requireAdmin, getSettingsByCategory);

/**
 * @route   PUT /api/admin/settings/bulk-update
 * @desc    Bulk update settings
 * @access  Admin (supervisor_sistem only)
 * @body    { settings: [{ key, value }] }
 */
router.put('/settings/bulk-update', requireAdmin, bulkUpdateSystemSettings);

/**
 * @route   POST /api/admin/settings/initialize
 * @desc    Initialize default settings
 * @access  Admin (supervisor_sistem only)
 */
router.post('/settings/initialize', requireAdmin, initializeDefaults);

/**
 * @route   PUT /api/admin/settings/:key/reset
 * @desc    Reset setting to default
 * @access  Admin (supervisor_sistem only)
 * @params  { key: setting_key }
 */
router.put('/settings/:key/reset', requireAdmin, resetSettingToDefault);

// =====================================================
// AUDIT LOG ROUTES - ADMIN ONLY
// =====================================================

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get all audit logs
 * @access  Admin (supervisor_sistem only)
 * @query   { page, limit, user_id, action, table_name, date_from, date_to }
 */
router.get('/audit-logs', requireAdmin, getAllAuditLogs);

/**
 * @route   GET /api/admin/audit-logs/:id
 * @desc    Get audit log detail
 * @access  Admin (supervisor_sistem only)
 * @params  { id: audit_log_id }
 */
router.get('/audit-logs/:id', requireAdmin, getAuditLogDetail);

/**
 * @route   GET /api/admin/audit-logs/record/:tableName/:recordId
 * @desc    Get audit logs for specific record
 * @access  Admin (supervisor_sistem only)
 * @params  { tableName: table_name, recordId: record_id }
 */
router.get('/audit-logs/record/:tableName/:recordId', requireAdmin, getRecordAuditHistory);

/**
 * @route   GET /api/admin/audit-logs/statistics
 * @desc    Get audit statistics
 * @access  Admin (supervisor_sistem only)
 * @query   { days }
 */
router.get('/audit-logs/statistics', requireAdmin, getAuditStatisticsData);

/**
 * @route   GET /api/admin/audit-logs/active-users
 * @desc    Get most active users
 * @access  Admin (supervisor_sistem only)
 * @query   { days, limit }
 */
router.get('/audit-logs/active-users', requireAdmin, getMostActiveUsersData);

/**
 * @route   GET /api/admin/audit-logs/user/:userId
 * @desc    Get user activity logs
 * @access  Admin (supervisor_sistem only)
 * @params  { userId: user_id }
 * @query   { page, limit, action, table_name, date_from, date_to }
 */
router.get('/audit-logs/user/:userId', requireAdmin, getUserActivityLogs);

/**
 * @route   GET /api/admin/audit-logs/table/:tableName
 * @desc    Get table activity logs
 * @access  Admin (supervisor_sistem only)
 * @params  { tableName: table_name }
 * @query   { page, limit, action, user_id, date_from, date_to }
 */
router.get('/audit-logs/table/:tableName', requireAdmin, getTableActivityLogs);

/**
 * @route   DELETE /api/admin/audit-logs/cleanup
 * @desc    Clean old audit logs
 * @access  Admin (supervisor_sistem only)
 * @body    { days_to_keep }
 */
router.delete('/audit-logs/cleanup', requireAdmin, cleanOldAuditLogsData);

/**
 * @route   GET /api/admin/audit-logs/export
 * @desc    Export audit logs
 * @access  Admin (supervisor_sistem only)
 * @query   { user_id, action, table_name, date_from, date_to }
 */
router.get('/audit-logs/export', requireAdmin, exportAuditLogs);

// =====================================================
// NOTIFICATION MANAGEMENT ROUTES - MANAGEMENT LEVEL
// =====================================================

/**
 * @route   GET /api/admin/notifications
 * @desc    Get all notifications
 * @access  Management (manajer_futsal+)
 * @query   { page, limit, user_id, type, priority, read_status, date_from, date_to }
 */
router.get('/notifications', requireManagement, getAllNotifications);

/**
 * @route   POST /api/admin/notifications
 * @desc    Create system notification
 * @access  Management (manajer_futsal+)
 * @body    { user_id, title, message, data, channels, priority }
 */
router.post('/notifications', requireManagement, createSystemNotificationAdmin);

/**
 * @route   POST /api/admin/notifications/broadcast
 * @desc    Broadcast notification
 * @access  Management (manajer_futsal+)
 * @body    { user_ids, title, message, data, channels, priority, user_filter }
 */
router.post('/notifications/broadcast', requireManagement, broadcastNotificationAdmin);

/**
 * @route   GET /api/admin/notifications/statistics
 * @desc    Get notification statistics
 * @access  Management (manajer_futsal+)
 * @query   { days }
 */
router.get('/notifications/statistics', requireManagement, getNotificationStatistics);

/**
 * @route   GET /api/admin/notifications/:id/status
 * @desc    Get notification delivery status
 * @access  Management (manajer_futsal+)
 * @params  { id: notification_id }
 */
router.get('/notifications/:id/status', requireManagement, getNotificationDeliveryStatus);

/**
 * @route   DELETE /api/admin/notifications/:id
 * @desc    Delete notification
 * @access  Management (manajer_futsal+)
 * @params  { id: notification_id }
 */
router.delete('/notifications/:id', requireManagement, deleteNotificationAdmin);

/**
 * @route   GET /api/admin/notifications/user/:userId
 * @desc    Get user notification summary
 * @access  Management (manajer_futsal+)
 * @params  { userId: user_id }
 */
router.get('/notifications/user/:userId', requireManagement, getUserNotificationSummary);

// =====================================================
// PROMOTION MANAGEMENT ROUTES - MANAGEMENT LEVEL
// =====================================================

/**
 * @route   GET /api/admin/promotions
 * @desc    Get all promotions
 * @access  Management (manajer_futsal+)
 * @query   { page, limit }
 */
router.get('/promotions', requireManagement, getAllPromotionsAdmin);

/**
 * @route   POST /api/admin/promotions
 * @desc    Create new promotion
 * @access  Management (manajer_futsal+)
 * @body    { code, name, description, type, value, min_amount, max_discount, usage_limit, user_limit, applicable_fields, applicable_days, applicable_hours, start_date, end_date }
 */
router.post('/promotions', requireManagement, createPromotionAdmin);

/**
 * @route   PUT /api/admin/promotions/:id
 * @desc    Update promotion
 * @access  Management (manajer_futsal+)
 * @params  { id: promotion_id }
 * @body    { name, description, value, min_amount, max_discount, usage_limit, user_limit, applicable_fields, applicable_days, applicable_hours, start_date, end_date, is_active }
 */
router.put('/promotions/:id', requireManagement, updatePromotionAdmin);

/**
 * @route   DELETE /api/admin/promotions/:id
 * @desc    Delete promotion
 * @access  Management (manajer_futsal+)
 * @params  { id: promotion_id }
 */
router.delete('/promotions/:id', requireManagement, deletePromotionAdmin);

/**
 * @route   GET /api/admin/promotions/:id/usage
 * @desc    Get promotion usage history
 * @access  Management (manajer_futsal+)
 * @params  { id: promotion_id }
 * @query   { page, limit }
 */
router.get('/promotions/:id/usage', requireManagement, getPromotionUsageHistoryAdmin);

/**
 * @route   GET /api/admin/promotions/analytics
 * @desc    Get promotion analytics
 * @access  Management (manajer_futsal+)
 * @query   { days }
 */
router.get('/promotions/analytics', requireManagement, getPromotionAnalytics);

/**
 * @route   PUT /api/admin/promotions/:id/toggle
 * @desc    Toggle promotion status
 * @access  Management (manajer_futsal+)
 * @params  { id: promotion_id }
 */
router.put('/promotions/:id/toggle', requireManagement, togglePromotionStatus);

// =====================================================
// ROLE MANAGEMENT ROUTES - MANAGEMENT LEVEL
// =====================================================

/**
 * @route   GET /api/admin/role-management/dashboard
 * @desc    Get role management dashboard
 * @access  Management (manajer_futsal+)
 */
router.get('/role-management/dashboard', requireManagement, getRoleManagementDashboard);

/**
 * @route   GET /api/admin/role-management/users
 * @desc    Get all users for role management
 * @access  Management (manajer_futsal+)
 */
router.get('/role-management/users', requireManagement, getAllUsersForRoleManagement);

/**
 * @route   POST /api/admin/role-management/request-change
 * @desc    Create role change request
 * @access  Management (manajer_futsal+)
 */
router.post('/role-management/request-change', requireManagement, requestRoleChange);

/**
 * @route   PUT /api/admin/role-management/change-role
 * @desc    Direct role change
 * @access  Management (manajer_futsal+)
 */
router.put('/role-management/change-role', requireManagement, changeUserRoleDirect);

// =====================================================
// ANALYTICS ROUTES - MANAGEMENT LEVEL
// =====================================================

/**
 * @route   GET /api/admin/analytics/business
 * @desc    Get business analytics
 * @access  Management (manajer_futsal+)
 */
router.get('/analytics/business', requireManagement, getBusinessAnalytics);

/**
 * @route   GET /api/admin/analytics/system
 * @desc    Get system analytics
 * @access  Admin (supervisor_sistem only)
 */
router.get('/analytics/system', requireAdmin, getSystemAnalytics);

/**
 * @route   GET /api/admin/analytics/performance
 * @desc    Get performance metrics
 * @access  Management (manajer_futsal+)
 */
router.get('/analytics/performance', requireManagement, getPerformanceMetrics);

// =====================================================
// BOOKING MANAGEMENT ROUTES - MANAGEMENT LEVEL
// =====================================================

/**
 * @route   GET /api/admin/bookings/statistics
 * @desc    Get booking statistics for admin dashboard
 * @access  Management (manajer_futsal+)
 * @query   { period, date_from, date_to }
 */
router.get('/bookings/statistics', requireManagement, getBookingStatisticsAdmin);

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings for admin management
 * @access  Management (manajer_futsal+)
 * @query   { page, limit, status, user_id, field_id, date_from, date_to }
 */
router.get('/bookings', requireManagement, getAllBookingsAdmin);

/**
 * @route   GET /api/admin/bookings/:id
 * @desc    Get booking detail for admin
 * @access  Management (manajer_futsal+)
 * @params  { id: booking_id }
 */
router.get('/bookings/:id', requireManagement, getBookingDetailAdmin);

/**
 * @route   PUT /api/admin/bookings/:id/status
 * @desc    Update booking status (admin override)
 * @access  Management (manajer_futsal+)
 * @params  { id: booking_id }
 * @body    { status, reason }
 */
router.put('/bookings/:id/status', requireManagement, updateBookingStatusAdmin);

// =====================================================
// AUTO-COMPLETION MANAGEMENT ROUTES - ADMIN LEVEL
// =====================================================

/**
 * @route   POST /api/admin/auto-completion/trigger
 * @desc    Manually trigger auto-completion process
 * @access  Admin (supervisor_sistem only)
 */
router.post('/auto-completion/trigger', requireAdmin, triggerAutoCompletion);

/**
 * @route   GET /api/admin/auto-completion/eligible
 * @desc    Get bookings eligible for auto-completion
 * @access  Admin (supervisor_sistem only)
 */
router.get('/auto-completion/eligible', requireAdmin, getEligibleBookings);

/**
 * @route   GET /api/admin/auto-completion/stats
 * @desc    Get auto-completion statistics
 * @access  Admin (supervisor_sistem only)
 * @query   { days }
 */
router.get('/auto-completion/stats', requireAdmin, getCompletionStats);

/**
 * @route   POST /api/admin/auto-completion/manual/:id
 * @desc    Manually complete a specific booking
 * @access  Admin (supervisor_sistem only)
 * @params  { id: booking_id }
 * @body    { reason }
 */
router.post('/auto-completion/manual/:id', requireAdmin, manualCompleteBooking);

/**
 * @route   GET /api/admin/auto-completion/config
 * @desc    Get auto-completion configuration
 * @access  Admin (supervisor_sistem only)
 */
router.get('/auto-completion/config', requireAdmin, getAutoCompletionConfig);

module.exports = router;
