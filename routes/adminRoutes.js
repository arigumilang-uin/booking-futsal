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
 * @route   GET /api/admin/audit-logs/statistics
 * @desc    Get audit statistics
 * @access  Admin (supervisor_sistem only)
 * @query   { days }
 */
router.get('/audit-logs/statistics', requireAdmin, getAuditStatisticsData);

/**
 * @route   GET /api/admin/audit-logs/record/:tableName/:recordId
 * @desc    Get audit logs for specific record
 * @access  Admin (supervisor_sistem only)
 * @params  { tableName: table_name, recordId: record_id }
 */
router.get('/audit-logs/record/:tableName/:recordId', requireAdmin, getRecordAuditHistory);

/**
 * @route   GET /api/admin/audit-logs/:id
 * @desc    Get audit log detail
 * @access  Admin (supervisor_sistem only)
 * @params  { id: audit_log_id }
 */
router.get('/audit-logs/:id', requireAdmin, getAuditLogDetail);

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
 * @route   GET /api/admin/users
 * @desc    Get all users for admin management
 * @access  Management (manajer_futsal+)
 * @query   { page, limit, role, status, search, sort_by, sort_order }
 */
router.get('/users', requireManagement, getAllUsersForRoleManagement);

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

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user detail
 * @access  Management (manajer_futsal+)
 * @params  { id: user_id }
 */
router.get('/users/:id', requireManagement, async (req, res) => {
  try {
    const { getUserByIdRaw } = require('../models/core/userModel');
    const { id } = req.params;

    const user = await getUserByIdRaw(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user detail'
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Management (manajer_futsal+)
 * @params  { id: user_id }
 * @body    { name, email, phone, role, is_active }
 */
router.put('/users/:id', requireManagement, async (req, res) => {
  try {
    const { updateUserProfile, updateUserRole, updateUserStatus } = require('../models/core/userModel');
    const { id } = req.params;
    const { name, email, phone, role, is_active } = req.body;

    let updatedUser = null;

    // Update profile fields if provided
    if (name !== undefined || email !== undefined || phone !== undefined) {
      updatedUser = await updateUserProfile(id, { name, email, phone });
    }

    // Update role if provided
    if (role !== undefined) {
      updatedUser = await updateUserRole(id, role);
    }

    // Update status if provided
    if (is_active !== undefined) {
      updatedUser = await updateUserStatus(id, is_active);
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found or no changes made'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Deactivate user (soft delete)
 * @access  Management (manajer_futsal+)
 * @params  { id: user_id }
 */
router.delete('/users/:id', requireManagement, async (req, res) => {
  try {
    const { updateUserStatus } = require('../models/core/userModel');
    const { id } = req.params;

    const updatedUser = await updateUserStatus(id, false);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user'
    });
  }
});

// =====================================================
// FIELD MANAGEMENT ROUTES - ADMIN LEVEL
// =====================================================

/**
 * @route   GET /api/admin/fields
 * @desc    Get all fields for admin management
 * @access  Management (manajer_futsal+)
 * @query   { page, limit, status, type, location, search }
 */
router.get('/fields', requireManagement, async (req, res) => {
  try {
    const { getAllFields } = require('../models/business/fieldModel');
    const { page = 1, limit = 20, status, type, location, search } = req.query;

    let fields = await getAllFields();

    // Apply filters
    if (status) {
      fields = fields.filter(field => field.status === status);
    }
    if (type) {
      fields = fields.filter(field => field.type === type);
    }
    if (location) {
      fields = fields.filter(field =>
        field.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    if (search) {
      fields = fields.filter(field =>
        field.name.toLowerCase().includes(search.toLowerCase()) ||
        field.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFields = fields.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedFields,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: fields.length,
        total_pages: Math.ceil(fields.length / limit)
      }
    });
  } catch (error) {
    console.error('Get admin fields error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fields'
    });
  }
});

/**
 * @route   GET /api/admin/fields/:id
 * @desc    Get field detail
 * @access  Management (manajer_futsal+)
 * @params  { id: field_id }
 */
router.get('/fields/:id', requireManagement, async (req, res) => {
  try {
    const { getFieldById } = require('../models/business/fieldModel');
    const { id } = req.params;

    const field = await getFieldById(id);
    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    res.json({
      success: true,
      data: field
    });
  } catch (error) {
    console.error('Get field detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get field detail'
    });
  }
});

/**
 * @route   POST /api/admin/fields
 * @desc    Create new field
 * @access  Management (manajer_futsal+)
 * @body    { name, type, description, price, capacity, location, facilities, etc. }
 */
router.post('/fields', requireManagement, async (req, res) => {
  try {
    const { createField } = require('../models/business/fieldModel');
    const adminId = req.rawUser.id;

    const {
      name, type, description, price, capacity, location, address,
      facilities, coordinates, price_weekend, price_member,
      operating_hours, operating_days, assigned_operator
    } = req.body;

    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }

    const fieldData = {
      name,
      type: type || 'futsal',
      description: description || '',
      price,
      capacity: capacity || 22,
      location: location || '',
      address: address || '',
      facilities: facilities || [],
      coordinates: coordinates || null,
      price_weekend: price_weekend || null,
      price_member: price_member || null,
      operating_hours: operating_hours || { start: '09:00', end: '24:00' },
      operating_days: operating_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      assigned_operator: assigned_operator || null,
      created_by: adminId
    };

    const newField = await createField(fieldData);

    res.status(201).json({
      success: true,
      message: 'Field created successfully',
      data: newField
    });
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create field'
    });
  }
});

/**
 * @route   PUT /api/admin/fields/:id
 * @desc    Update field
 * @access  Management (manajer_futsal+)
 * @params  { id: field_id }
 * @body    { field_data }
 */
router.put('/fields/:id', requireManagement, async (req, res) => {
  try {
    const { updateField } = require('../models/business/fieldModel');
    const adminId = req.rawUser.id;
    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_by: adminId
    };

    const updatedField = await updateField(id, updateData);
    if (!updatedField) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    res.json({
      success: true,
      message: 'Field updated successfully',
      data: updatedField
    });
  } catch (error) {
    console.error('Update field error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update field'
    });
  }
});

/**
 * @route   DELETE /api/admin/fields/:id
 * @desc    Delete field (soft delete)
 * @access  Management (manajer_futsal+)
 * @params  { id: field_id }
 */
router.delete('/fields/:id', requireManagement, async (req, res) => {
  try {
    const { updateField } = require('../models/business/fieldModel');
    const { id } = req.params;

    const updatedField = await updateField(id, { status: 'deleted' });
    if (!updatedField) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    res.json({
      success: true,
      message: 'Field deleted successfully',
      data: updatedField
    });
  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete field'
    });
  }
});

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
