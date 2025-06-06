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
 * @swagger
 * /api/admin/settings:
 *   get:
 *     tags: [Admin]
 *     summary: Get semua system settings 🟡 MANAGEMENT
 *     description: Endpoint untuk mendapatkan semua pengaturan sistem
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                       value:
 *                         type: string
 *                       description:
 *                         type: string
 *                       is_public:
 *                         type: boolean
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     tags: [Admin]
 *     summary: Get semua audit logs 🟡 MANAGEMENT
 *     description: Endpoint untuk mendapatkan semua log audit sistem
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter berdasarkan action (CREATE, UPDATE, DELETE)
 *       - in: query
 *         name: table_name
 *         schema:
 *           type: string
 *         description: Filter berdasarkan nama tabel
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal mulai
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal akhir
 *     responses:
 *       200:
 *         description: Daftar audit logs berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       action:
 *                         type: string
 *                       table_name:
 *                         type: string
 *                       record_id:
 *                         type: integer
 *                       old_values:
 *                         type: object
 *                       new_values:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 * @swagger
 * /api/admin/notifications:
 *   get:
 *     tags: [Admin]
 *     summary: Get semua notifikasi 🟡 MANAGEMENT
 *     description: Endpoint untuk mendapatkan semua notifikasi sistem
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan user ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter berdasarkan tipe notifikasi
 *     responses:
 *       200:
 *         description: Daftar notifikasi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                       type:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [Admin]
 *     summary: Buat notifikasi sistem 🟡 MANAGEMENT
 *     description: Endpoint untuk membuat notifikasi sistem baru
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Maintenance Scheduled"
 *               message:
 *                 type: string
 *                 example: "System maintenance will be performed tonight"
 *               user_id:
 *                 type: integer
 *                 example: 123
 *               type:
 *                 type: string
 *                 example: "system"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: "high"
 *     responses:
 *       201:
 *         description: Notifikasi berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notification created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     message:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 * @swagger
 * /api/admin/promotions:
 *   get:
 *     tags: [Admin]
 *     summary: Get semua promosi 🟡 MANAGEMENT
 *     description: Endpoint untuk mendapatkan semua promosi untuk management
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *         description: Filter berdasarkan status promosi
 *     responses:
 *       200:
 *         description: Daftar promosi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       type:
 *                         type: string
 *                       value:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 *                       usage_count:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [Admin]
 *     summary: Buat promosi baru 🟡 MANAGEMENT
 *     description: Endpoint untuk membuat promosi baru
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, type, value]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Weekend Discount"
 *               code:
 *                 type: string
 *                 example: "WEEKEND20"
 *               description:
 *                 type: string
 *                 example: "20% discount for weekend bookings"
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 example: "percentage"
 *               value:
 *                 type: string
 *                 example: "20.00"
 *               min_booking_amount:
 *                 type: string
 *                 example: "50000.00"
 *               usage_limit:
 *                 type: integer
 *                 example: 100
 *               valid_from:
 *                 type: string
 *                 format: date-time
 *               valid_until:
 *                 type: string
 *                 format: date-time
 *               applicable_fields:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Promosi berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Promotion created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 * @swagger
 * /api/admin/promotions/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update promosi 🟡 MANAGEMENT
 *     description: |
 *       Endpoint untuk mengupdate promosi
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem)
 *       - ✅ **Manager Futsal** (manajer_futsal)
 *       - ❌ Staff lainnya tidak dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID promosi yang akan diupdate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Diskon Weekend Updated"
 *               description:
 *                 type: string
 *                 example: "Diskon khusus untuk booking weekend"
 *               value:
 *                 type: number
 *                 example: 15
 *               min_amount:
 *                 type: number
 *                 example: 100000
 *               max_discount:
 *                 type: number
 *                 example: 50000
 *               usage_limit:
 *                 type: integer
 *                 example: 100
 *               user_limit:
 *                 type: integer
 *                 example: 1
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Promosi berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Promotion updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Promotion'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
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
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get semua users 🟡 MANAGEMENT
 *     description: |
 *       Endpoint untuk mendapatkan semua users untuk management
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem) - Dapat melihat SEMUA users
 *       - ✅ **Manager Futsal** (manajer_futsal) - Hanya dapat melihat users dengan role di BAWAH mereka
 *       - ❌ Staff lainnya tidak dapat mengakses
 *
 *       **🛡️ ROLE HIERARCHY PROTECTION:**
 *       - Manager TIDAK dapat melihat/mengelola Supervisor
 *       - Setiap role hanya dapat mengelola role di bawah level mereka
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [pengunjung, penyewa, staff_kasir, operator_lapangan, manajer_futsal, supervisor_sistem]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get detail user 🟡 MANAGEMENT
 *     description: |
 *       Endpoint untuk mendapatkan detail user berdasarkan ID
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem) - Dapat melihat SEMUA users
 *       - ✅ **Manager Futsal** (manajer_futsal) - Hanya dapat melihat users dengan role di BAWAH mereka
 *       - ❌ Staff lainnya tidak dapat mengakses
 *
 *       **🛡️ ROLE HIERARCHY PROTECTION:**
 *       - Manager TIDAK dapat melihat detail Supervisor
 *       - Error 403 jika mencoba akses user dengan role lebih tinggi
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *     responses:
 *       200:
 *         description: Detail user berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
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

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update user 🟡 MANAGEMENT
 *     description: Endpoint untuk mengupdate data user
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.updated@example.com"
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *               role:
 *                 type: string
 *                 enum: [pengunjung, penyewa, staff_kasir, operator_lapangan, manajer_futsal, supervisor_sistem]
 *                 example: "penyewa"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Management (manajer_futsal+)
 * @params  { id: user_id }
 * @body    { name, email, phone, role, is_active }
 */
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

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Deactivate user 🟡 MANAGEMENT
 *     description: |
 *       Endpoint untuk menonaktifkan user (soft delete)
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem)
 *       - ✅ **Manager Futsal** (manajer_futsal)
 *       - ❌ Staff lainnya tidak dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user yang akan dinonaktifkan
 *     responses:
 *       200:
 *         description: User berhasil dinonaktifkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deactivated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - Hanya Management yang dapat menonaktifkan user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied - Management level required"
 *                 required_roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["manajer_futsal", "supervisor_sistem"]
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   DELETE /api/admin/users/:id
 * @desc    Deactivate user (soft delete)
 * @access  Management (manajer_futsal+)
 * @params  { id: user_id }
 */
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

// =====================================================
// FIELD MANAGEMENT ROUTES - ADMIN LEVEL
// =====================================================

/**
 * @swagger
 * /api/admin/fields:
 *   get:
 *     tags: [Admin]
 *     summary: Get semua lapangan 🟡 MANAGEMENT
 *     description: |
 *       Endpoint untuk mendapatkan daftar semua lapangan dengan filter
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem)
 *       - ✅ **Manager Futsal** (manajer_futsal)
 *       - ❌ Staff lainnya tidak dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman data
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter berdasarkan status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter berdasarkan tipe lapangan
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter berdasarkan lokasi
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan nama lapangan
 *     responses:
 *       200:
 *         description: Daftar lapangan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     fields:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Field'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_fields:
 *                           type: integer
 *                         active_fields:
 *                           type: integer
 *                         inactive_fields:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - Hanya Management yang dapat mengakses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied - Management level required"
 *                 required_roles:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["manajer_futsal", "supervisor_sistem"]
 *
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
 * @swagger
 * /api/admin/fields/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get detail lapangan 🟡 MANAGEMENT
 *     description: |
 *       Endpoint untuk mendapatkan detail lapangan untuk admin
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem)
 *       - ✅ **Manager Futsal** (manajer_futsal)
 *       - ❌ Staff lainnya tidak dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan yang akan diambil
 *     responses:
 *       200:
 *         description: Detail lapangan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Field'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - Hanya Management yang dapat mengakses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied - Management level required"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
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
 * @swagger
 * /api/admin/fields:
 *   post:
 *     tags: [Admin]
 *     summary: Create lapangan baru 🟡 MANAGEMENT
 *     description: |
 *       Endpoint untuk membuat lapangan baru
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem)
 *       - ✅ **Manager Futsal** (manajer_futsal)
 *       - ❌ Staff lainnya tidak dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Lapangan A"
 *               type:
 *                 type: string
 *                 example: "futsal"
 *               description:
 *                 type: string
 *                 example: "Lapangan futsal indoor dengan rumput sintetis"
 *               price:
 *                 type: number
 *                 example: 100000
 *               capacity:
 *                 type: integer
 *                 example: 22
 *               location:
 *                 type: string
 *                 example: "Lantai 1"
 *               address:
 *                 type: string
 *                 example: "Jl. Futsal No. 123"
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["AC", "Sound System", "Lighting"]
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       201:
 *         description: Lapangan berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Field created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Field'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - Hanya Management yang dapat membuat lapangan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied - Management level required"
 *
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
 * @swagger
 * /api/admin/fields/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update lapangan 🟡 MANAGEMENT
 *     description: |
 *       Endpoint untuk mengupdate data lapangan
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem)
 *       - ✅ **Manager Futsal** (manajer_futsal)
 *       - ❌ Staff lainnya tidak dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan yang akan diupdate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Lapangan A Updated"
 *               type:
 *                 type: string
 *                 example: "futsal"
 *               description:
 *                 type: string
 *                 example: "Lapangan futsal indoor dengan fasilitas lengkap"
 *               price:
 *                 type: number
 *                 example: 120000
 *               capacity:
 *                 type: integer
 *                 example: 22
 *               location:
 *                 type: string
 *                 example: "Lantai 2"
 *               address:
 *                 type: string
 *                 example: "Jl. Futsal No. 123"
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["AC", "Sound System", "Lighting", "Parking"]
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Lapangan berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Field updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Field'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - Hanya Management yang dapat mengupdate lapangan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied - Management level required"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
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
 * @swagger
 * /api/admin/fields/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete lapangan 🟡 MANAGEMENT
 *     description: |
 *       Endpoint untuk menghapus lapangan (soft delete)
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem)
 *       - ✅ **Manager Futsal** (manajer_futsal)
 *       - ❌ Staff lainnya tidak dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan yang akan dihapus
 *     responses:
 *       200:
 *         description: Lapangan berhasil dihapus (soft delete)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Field deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Lapangan A"
 *                     is_active:
 *                       type: boolean
 *                       example: false
 *                     deleted_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - Hanya Management yang dapat menghapus lapangan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied - Management level required"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
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
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     tags: [Admin]
 *     summary: Get semua booking untuk admin 🟡 MANAGEMENT
 *     description: Endpoint untuk mendapatkan semua booking dengan akses admin/management
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter berdasarkan status booking
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan user ID
 *       - in: query
 *         name: field_id
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan field ID
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal mulai
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal akhir
 *     responses:
 *       200:
 *         description: Daftar booking berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 * @swagger
 * /api/admin/auto-completion/trigger:
 *   post:
 *     tags: [Admin]
 *     summary: Trigger auto-completion manual 🔴 SUPERVISOR ONLY
 *     description: Endpoint untuk memicu proses auto-completion booking secara manual (supervisor only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Auto-completion berhasil dijalankan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Auto-completion process triggered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed_bookings:
 *                       type: integer
 *                       example: 5
 *                     completed_bookings:
 *                       type: integer
 *                       example: 3
 *                     failed_bookings:
 *                       type: integer
 *                       example: 0
 *                     execution_time:
 *                       type: string
 *                       example: "2.5s"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
