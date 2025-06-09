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

const {
  getCacheStats,
  clearCache,
  getCacheKeys,
  getCacheHealth,
  warmUpCache
} = require('../controllers/admin/cacheController');

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

router.get('/audit-logs/active-users', requireAdmin, getMostActiveUsersData);

router.get('/audit-logs/user/:userId', requireAdmin, getUserActivityLogs);

/**
 * @route   GET /api/admin/audit-logs/table/:tableName
 * @desc    Get table activity logs
 * @access  Admin (supervisor_sistem only)
 * @params  { tableName: table_name }
 * @query   { page, limit, action, user_id, date_from, date_to }
 */
router.get('/audit-logs/table/:tableName', requireAdmin, getTableActivityLogs);

router.delete('/audit-logs/cleanup', requireAdmin, cleanOldAuditLogsData);

router.post('/audit-logs/test-cleanup', requireAdmin, async (req, res) => {
  try {
    const daysToKeep = parseInt(req.body.days_to_keep) || 2;
    console.log('🧪 TEST CLEANUP - Days to keep:', daysToKeep);

    const pool = require('../config/db');

    // Show what would be deleted
    const previewQuery = `
      SELECT
        id, action, created_at, user_id,
        AGE(NOW(), created_at) as age,
        EXTRACT(EPOCH FROM (NOW() - created_at))/86400 as days_old,
        (created_at < NOW() - INTERVAL '1 day' * $1) as will_be_deleted
      FROM audit_logs
      ORDER BY created_at ASC
    `;
    const previewResult = await pool.query(previewQuery, [daysToKeep]);

    // Count what would be deleted
    const countQuery = `
      SELECT COUNT(*) as count_to_delete
      FROM audit_logs
      WHERE created_at < NOW() - INTERVAL '1 day' * $1
    `;
    const countResult = await pool.query(countQuery, [daysToKeep]);
    const countToDelete = parseInt(countResult.rows[0].count_to_delete);

    console.log('📊 Records that would be deleted:', countToDelete);
    previewResult.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Action: ${row.action}, Date: ${row.created_at}, Days Old: ${row.days_old?.toFixed(2)}, Will Delete: ${row.will_be_deleted}`);
    });

    res.json({
      success: true,
      message: `Test cleanup preview - ${countToDelete} records would be deleted with ${daysToKeep} days retention`,
      data: {
        days_to_keep: daysToKeep,
        count_to_delete: countToDelete,
        records_preview: previewResult.rows,
        current_time: new Date().toISOString(),
        cutoff_time: new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)).toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Test cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Test cleanup failed',
      error: error.message
    });
  }
});

router.get('/audit-logs/export', requireAdmin, exportAuditLogs);

// =====================================================
// NOTIFICATION MANAGEMENT ROUTES - MANAGEMENT LEVEL
// =====================================================

router.get('/notifications', requireManagement, getAllNotifications);

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

router.get('/promotions', requireManagement, getAllPromotionsAdmin);

/**
 * @route   POST /api/admin/promotions
 * @desc    Create new promotion
 * @access  Management (manajer_futsal+)
 * @body    { code, name, description, type, value, min_amount, max_discount, usage_limit, user_limit, applicable_fields, applicable_days, applicable_hours, start_date, end_date }
 */
router.post('/promotions', requireManagement, createPromotionAdmin);

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

    // Role hierarchy validation
    const currentUserRole = req.rawUser.role;
    const targetUserRole = user.role;

    // Define role hierarchy levels
    const roleHierarchy = {
      'supervisor_sistem': 6,
      'manajer_futsal': 5,
      'operator_lapangan': 4,
      'staff_kasir': 3,
      'penyewa': 2,
      'pengunjung': 1
    };

    const currentUserLevel = roleHierarchy[currentUserRole] || 0;
    const targetUserLevel = roleHierarchy[targetUserRole] || 0;

    // Manager cannot access supervisor data
    if (currentUserRole === 'manajer_futsal' && targetUserRole === 'supervisor_sistem') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Cannot access supervisor data'
      });
    }

    // Only allow access to users with lower or equal hierarchy level
    if (currentUserLevel < targetUserLevel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Insufficient role level'
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

router.put('/users/:id', requireManagement, async (req, res) => {
  try {
    const { updateUserProfile, updateUserRole, updateUserStatus, getUserByIdRaw } = require('../models/core/userModel');
    const { id } = req.params;
    const { name, email, phone, role, is_active } = req.body;

    // Validate user exists and check role hierarchy
    const existingUser = await getUserByIdRaw(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Role hierarchy validation
    const currentUserRole = req.rawUser.role;
    const targetUserRole = existingUser.role;

    // Define role hierarchy levels
    const roleHierarchy = {
      'supervisor_sistem': 6,
      'manajer_futsal': 5,
      'operator_lapangan': 4,
      'staff_kasir': 3,
      'penyewa': 2,
      'pengunjung': 1
    };

    const currentUserLevel = roleHierarchy[currentUserRole] || 0;
    const targetUserLevel = roleHierarchy[targetUserRole] || 0;

    // Manager cannot update supervisor
    if (currentUserRole === 'manajer_futsal' && targetUserRole === 'supervisor_sistem') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Cannot modify supervisor data'
      });
    }

    // Only allow modification of users with lower hierarchy level
    if (currentUserLevel <= targetUserLevel && currentUserRole !== targetUserRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Insufficient role level'
      });
    }

    // If trying to change role, validate new role
    if (role && role !== existingUser.role) {
      const newRoleLevel = roleHierarchy[role] || 0;

      // Cannot assign role higher than or equal to current user's role
      if (newRoleLevel >= currentUserLevel) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - Cannot assign higher or equal role'
        });
      }
    }

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

router.delete('/users/:id', requireManagement, async (req, res) => {
  try {
    const { updateUserStatus, getUserByIdRaw } = require('../models/core/userModel');
    const { id } = req.params;

    // Validate user exists and check role hierarchy
    const existingUser = await getUserByIdRaw(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Role hierarchy validation
    const currentUserRole = req.rawUser.role;
    const targetUserRole = existingUser.role;

    // Define role hierarchy levels
    const roleHierarchy = {
      'supervisor_sistem': 6,
      'manajer_futsal': 5,
      'operator_lapangan': 4,
      'staff_kasir': 3,
      'penyewa': 2,
      'pengunjung': 1
    };

    const currentUserLevel = roleHierarchy[currentUserRole] || 0;
    const targetUserLevel = roleHierarchy[targetUserRole] || 0;

    // Manager cannot delete supervisor
    if (currentUserRole === 'manajer_futsal' && targetUserRole === 'supervisor_sistem') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Cannot delete supervisor'
      });
    }

    // Only allow deletion of users with lower hierarchy level
    if (currentUserLevel <= targetUserLevel && currentUserRole !== targetUserRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Insufficient role level'
      });
    }

    const updatedUser = await updateUserStatus(id, false);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Failed to deactivate user'
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

router.patch('/users/:id/status', requireManagement, async (req, res) => {
  try {
    const { updateUserStatus, getUserByIdRaw } = require('../models/core/userModel');
    const { id } = req.params;
    const { is_active } = req.body;

    // Validate input
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_active must be a boolean value'
      });
    }

    // Validate user exists
    const existingUser = await getUserByIdRaw(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Role hierarchy validation
    const currentUserRole = req.rawUser.role;
    const targetUserRole = existingUser.role;

    // Define role hierarchy levels
    const roleHierarchy = {
      'supervisor_sistem': 6,
      'manajer_futsal': 5,
      'operator_lapangan': 4,
      'staff_kasir': 3,
      'penyewa': 2,
      'pengunjung': 1
    };

    const currentUserLevel = roleHierarchy[currentUserRole] || 0;
    const targetUserLevel = roleHierarchy[targetUserRole] || 0;

    // Manager cannot modify supervisor
    if (currentUserRole === 'manajer_futsal' && targetUserRole === 'supervisor_sistem') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Cannot modify supervisor'
      });
    }

    // Only allow modification of users with lower hierarchy level
    if (currentUserLevel <= targetUserLevel && currentUserRole !== targetUserRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Insufficient role level'
      });
    }

    const updatedUser = await updateUserStatus(id, is_active);
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// =====================================================
// FIELD MANAGEMENT ROUTES - ADMIN LEVEL
// =====================================================

router.get('/fields', requireManagement, async (req, res) => {
  try {
    const { getAllFields } = require('../models/business/fieldModel');
    const { page = 1, limit = 20, status, type, location, search } = req.query;

    let fields = await getAllFields(1, 1000); // Get all fields with high limit

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

router.delete('/fields/:id', requireManagement, async (req, res) => {
  try {
    const { deleteField, getFieldById } = require('../models/business/fieldModel');
    const { id } = req.params;

    // Check if field exists first
    const existingField = await getFieldById(id);
    if (!existingField) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    // Use the dedicated deleteField function (soft delete)
    const deletedField = await deleteField(id);
    if (!deletedField) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete field'
      });
    }

    res.json({
      success: true,
      message: 'Field deleted successfully (set to inactive)',
      data: {
        id: deletedField.id,
        name: deletedField.name,
        status: deletedField.status,
        updated_at: deletedField.updated_at
      }
    });
  } catch (error) {
    console.error('Delete field error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete field',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/fields/:id/assign-operator', requireManagement, async (req, res) => {
  try {
    const { updateField, getFieldById } = require('../models/business/fieldModel');
    const { getUserByIdRaw } = require('../models/core/userModel');
    const adminId = req.rawUser.id;
    const { id } = req.params;
    const { operator_id } = req.body;

    // Check if field exists
    const existingField = await getFieldById(id);
    if (!existingField) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    // If operator_id is provided, validate the operator
    if (operator_id !== null && operator_id !== undefined) {
      const operator = await getUserByIdRaw(operator_id);
      if (!operator) {
        return res.status(400).json({
          success: false,
          message: 'Operator not found'
        });
      }

      if (operator.role !== 'operator_lapangan') {
        return res.status(400).json({
          success: false,
          message: 'Invalid operator - must have operator_lapangan role'
        });
      }
    }

    // Update field with assigned operator
    const updatedField = await updateField(id, {
      assigned_operator: operator_id,
      updated_by: adminId
    });

    res.json({
      success: true,
      message: operator_id ? 'Operator assigned to field successfully' : 'Operator unassigned from field successfully',
      data: {
        field_id: updatedField.id,
        field_name: updatedField.name,
        assigned_operator: updatedField.assigned_operator,
        operator_name: updatedField.operator_name || null
      }
    });

  } catch (error) {
    console.error('Assign operator to field error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign operator to field',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/operators', requireManagement, async (req, res) => {
  try {
    const { getAllUsers } = require('../models/core/userModel');
    const { getFieldsByOperator } = require('../models/business/fieldModel');
    const { available_only } = req.query;

    // Get all operators
    const allUsers = await getAllUsers();
    const operators = allUsers.filter(user => user.role === 'operator_lapangan' && user.is_active);

    // Get assigned fields for each operator
    const operatorsWithFields = await Promise.all(
      operators.map(async (operator) => {
        const assignedFields = await getFieldsByOperator(operator.id);
        return {
          id: operator.id,
          name: operator.name,
          email: operator.email,
          employee_id: operator.employee_id,
          assigned_fields: assignedFields.map(field => ({
            field_id: field.id,
            field_name: field.name
          })),
          is_available: assignedFields.length === 0
        };
      })
    );

    // Filter available only if requested
    const filteredOperators = available_only === 'true'
      ? operatorsWithFields.filter(op => op.is_available)
      : operatorsWithFields;

    res.json({
      success: true,
      data: filteredOperators
    });

  } catch (error) {
    console.error('Get operators error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get operators',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// =====================================================
// TRACKING TABLES ROUTES - MANAGEMENT LEVEL
// =====================================================

/**
 * @route   GET /api/admin/bookings/:id/history
 * @desc    Get booking history
 * @access  Management (manajer_futsal+)
 * @params  { id: booking_id }
 */
router.get('/bookings/:id/history', requireManagement, async (req, res) => {
  try {
    console.log(`📋 Getting booking history for booking ID: ${req.params.id}`);
    const { getBookingHistory } = require('../models/tracking/bookingHistoryModel');
    const { id } = req.params;

    console.log(`📋 Calling getBookingHistory with ID: ${id}`);
    const history = await getBookingHistory(id);
    console.log(`📋 Booking history result: ${history.length} records found`);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('❌ Get booking history error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      bookingId: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get booking history',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/admin/bookings/:id/timeline
 * @desc    Get booking timeline (history + payment events)
 * @access  Management (manajer_futsal+)
 * @params  { id: booking_id }
 */
router.get('/bookings/:id/timeline', requireManagement, async (req, res) => {
  try {
    console.log(`📅 Getting booking timeline for booking ID: ${req.params.id}`);
    const { getBookingTimeline } = require('../models/tracking/bookingHistoryModel');
    const { id } = req.params;

    console.log(`📅 Calling getBookingTimeline with ID: ${id}`);
    const timeline = await getBookingTimeline(id);
    console.log(`📅 Booking timeline result: ${timeline.length} events found`);

    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('❌ Get booking timeline error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      bookingId: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get booking timeline',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/admin/payments/:id/logs
 * @desc    Get payment logs
 * @access  Management (manajer_futsal+)
 * @params  { id: payment_id }
 */
router.get('/payments/:id/logs', requireManagement, async (req, res) => {
  try {
    console.log(`💳 Getting payment logs for payment ID: ${req.params.id}`);
    const { getPaymentLogs } = require('../models/tracking/paymentLogModel');
    const { id } = req.params;

    console.log(`💳 Calling getPaymentLogs with ID: ${id}`);
    const logs = await getPaymentLogs(id);
    console.log(`💳 Payment logs result: ${logs.length} records found`);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('❌ Get payment logs error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      paymentId: req.params.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get payment logs',
      details: error.message
    });
  }
});

// =====================================================
// CACHE MANAGEMENT ROUTES - ADMIN ONLY
// =====================================================

/**
 * @route   GET /api/admin/cache/stats
 * @desc    Get cache statistics
 * @access  Admin (supervisor_sistem only)
 */
router.get('/cache/stats', requireAdmin, getCacheStats);

/**
 * @route   GET /api/admin/cache/health
 * @desc    Get cache health assessment
 * @access  Admin (supervisor_sistem only)
 */
router.get('/cache/health', requireAdmin, getCacheHealth);

/**
 * @route   GET /api/admin/cache/:type/keys
 * @desc    Get cache keys by type
 * @access  Admin (supervisor_sistem only)
 * @params  { type: field|user|statistics|system }
 */
router.get('/cache/:type/keys', requireAdmin, getCacheKeys);

/**
 * @route   DELETE /api/admin/cache/:type
 * @desc    Clear cache by type
 * @access  Admin (supervisor_sistem only)
 * @params  { type: field|user|statistics|system|all }
 */
router.delete('/cache/:type', requireAdmin, clearCache);

/**
 * @route   POST /api/admin/cache/warmup
 * @desc    Warm up cache with frequently accessed data
 * @access  Admin (supervisor_sistem only)
 */
router.post('/cache/warmup', requireAdmin, warmUpCache);

module.exports = router;
