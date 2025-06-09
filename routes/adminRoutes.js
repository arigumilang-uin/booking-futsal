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
 * @swagger
 * /api/admin/audit-logs/statistics:
 *   get:
 *     tags: [Admin - Audit System]
 *     summary: Get audit logs statistics 🔴 SUPERVISOR ONLY
 *     description: |
 *       Endpoint untuk mendapatkan statistik audit logs sistem
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem) ONLY
 *       - ❌ Manager dan staff lainnya TIDAK dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Periode hari untuk statistik (default 30 hari)
 *     responses:
 *       200:
 *         description: Statistik audit logs berhasil diambil
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
 *                     period_days:
 *                       type: integer
 *                       example: 30
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         total_logs:
 *                           type: integer
 *                           example: 150
 *                         today_logs:
 *                           type: integer
 *                           example: 25
 *                         unique_users:
 *                           type: integer
 *                           example: 8
 *                         critical_actions:
 *                           type: integer
 *                           example: 3
 *                         create_actions:
 *                           type: integer
 *                           example: 45
 *                         update_actions:
 *                           type: integer
 *                           example: 67
 *                         delete_actions:
 *                           type: integer
 *                           example: 12
 *                         login_actions:
 *                           type: integer
 *                           example: 89
 *                         logout_actions:
 *                           type: integer
 *                           example: 76
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 * @swagger
 * /api/admin/audit-logs/active-users:
 *   get:
 *     tags: [Admin - Audit System]
 *     summary: Get most active users 🔴 SUPERVISOR ONLY
 *     description: |
 *       Endpoint untuk mendapatkan daftar pengguna paling aktif berdasarkan audit logs
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem) ONLY
 *       - ❌ Manager dan staff lainnya TIDAK dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Periode hari untuk analisis aktivitas
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah maksimal pengguna yang ditampilkan
 *     responses:
 *       200:
 *         description: Daftar pengguna paling aktif berhasil diambil
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
 *                     period_days:
 *                       type: integer
 *                       example: 30
 *                     active_users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                             example: 1
 *                           user_name:
 *                             type: string
 *                             example: "John Doe"
 *                           user_email:
 *                             type: string
 *                             example: "john@example.com"
 *                           user_role:
 *                             type: string
 *                             example: "supervisor_sistem"
 *                           activity_count:
 *                             type: integer
 *                             example: 156
 *                           login_count:
 *                             type: integer
 *                             example: 45
 *                           last_activity:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                       example: 10
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * @route   GET /api/admin/audit-logs/active-users
 * @desc    Get most active users
 * @access  Admin (supervisor_sistem only)
 * @query   { days, limit }
 */
router.get('/audit-logs/active-users', requireAdmin, getMostActiveUsersData);

/**
 * @swagger
 * /api/admin/audit-logs/user/{userId}:
 *   get:
 *     tags: [Admin - Audit System]
 *     summary: Get user activity logs 🔴 SUPERVISOR ONLY
 *     description: |
 *       Endpoint untuk mendapatkan riwayat aktivitas pengguna tertentu
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem) ONLY
 *       - ❌ Manager dan staff lainnya TIDAK dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pengguna yang akan dilihat aktivitasnya
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
 *           default: 20
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [LOGIN, LOGOUT, CREATE, UPDATE, DELETE]
 *         description: Filter berdasarkan jenis aksi
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
 *         description: Filter tanggal mulai (YYYY-MM-DD)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal akhir (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Riwayat aktivitas pengguna berhasil diambil
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
 *                     user_info:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuditLog'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Pengguna tidak ditemukan
 *
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
 * @swagger
 * /api/admin/audit-logs/cleanup:
 *   delete:
 *     tags: [Admin - Audit System]
 *     summary: Clean old audit logs 🔴 SUPERVISOR ONLY
 *     description: |
 *       Endpoint untuk membersihkan audit logs lama berdasarkan retention period
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem) ONLY
 *       - ❌ Manager dan staff lainnya TIDAK dapat mengakses
 *
 *       **⚠️ PERINGATAN:**
 *       - Operasi ini akan menghapus data secara permanen
 *       - Minimal retention period adalah 1 hari
 *       - Gunakan test-cleanup endpoint untuk preview terlebih dahulu
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [days_to_keep]
 *             properties:
 *               days_to_keep:
 *                 type: integer
 *                 minimum: 1
 *                 example: 90
 *                 description: Jumlah hari data yang akan disimpan (minimal 1 hari)
 *     responses:
 *       200:
 *         description: Cleanup berhasil dilakukan
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
 *                   example: "5 log audit lama berhasil dihapus"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted_count:
 *                       type: integer
 *                       example: 5
 *                     days_kept:
 *                       type: integer
 *                       example: 90
 *                     preview:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           action:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                           will_be_deleted:
 *                             type: boolean
 *       400:
 *         description: Parameter tidak valid
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
 *                   example: "Minimal 1 hari data harus disimpan"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * @route   DELETE /api/admin/audit-logs/cleanup
 * @desc    Clean old audit logs
 * @access  Admin (supervisor_sistem only)
 * @body    { days_to_keep }
 */
router.delete('/audit-logs/cleanup', requireAdmin, cleanOldAuditLogsData);

/**
 * @swagger
 * /api/admin/audit-logs/test-cleanup:
 *   post:
 *     tags: [Admin - Audit System]
 *     summary: Test cleanup preview 🔴 SUPERVISOR ONLY
 *     description: |
 *       Endpoint untuk preview cleanup operation tanpa menghapus data
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem) ONLY
 *       - ❌ Manager dan staff lainnya TIDAK dapat mengakses
 *
 *       **🧪 TESTING PURPOSE:**
 *       - Menampilkan preview records yang akan dihapus
 *       - Tidak menghapus data apapun (safe operation)
 *       - Berguna untuk verifikasi sebelum cleanup sesungguhnya
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [days_to_keep]
 *             properties:
 *               days_to_keep:
 *                 type: integer
 *                 minimum: 1
 *                 example: 30
 *                 description: Jumlah hari data yang akan disimpan untuk testing
 *     responses:
 *       200:
 *         description: Preview cleanup berhasil
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
 *                   example: "Test cleanup preview - 3 records would be deleted with 30 days retention"
 *                 data:
 *                   type: object
 *                   properties:
 *                     days_to_keep:
 *                       type: integer
 *                       example: 30
 *                     count_to_delete:
 *                       type: integer
 *                       example: 3
 *                     records_preview:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           action:
 *                             type: string
 *                             example: "LOGIN"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           days_old:
 *                             type: number
 *                             example: 35.5
 *                           will_be_deleted:
 *                             type: boolean
 *                             example: true
 *                     current_time:
 *                       type: string
 *                       format: date-time
 *                     cutoff_time:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         description: Test cleanup gagal
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
 *                   example: "Test cleanup failed"
 *                 error:
 *                   type: string
 *
 * @route   POST /api/admin/audit-logs/test-cleanup
 * @desc    Test cleanup preview (shows what would be deleted)
 * @access  Admin (supervisor_sistem only)
 * @body    { days_to_keep }
 */
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

/**
 * @swagger
 * /api/admin/audit-logs/export:
 *   get:
 *     tags: [Admin - Audit System]
 *     summary: Export audit logs to CSV 🔴 SUPERVISOR ONLY
 *     description: |
 *       Endpoint untuk mengekspor audit logs ke format CSV
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem) ONLY
 *       - ❌ Manager dan staff lainnya TIDAK dapat mengakses
 *
 *       **📁 EXPORT FORMAT:**
 *       - File CSV dengan header: ID, User, Action, Table, Record ID, IP Address, Created At
 *       - Maksimal 10,000 records per export
 *       - Filter dapat diterapkan untuk membatasi data
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [LOGIN, LOGOUT, CREATE, UPDATE, DELETE]
 *         description: Filter berdasarkan jenis aksi
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
 *         description: Filter tanggal mulai (YYYY-MM-DD)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal akhir (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: File CSV audit logs
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: attachment; filename=audit_logs.csv
 *             schema:
 *               type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         description: Export gagal
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
 *                   example: "Gagal mengekspor log audit"
 *
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
 * @swagger
 * /api/admin/notifications:
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
 *                 description: "Judul notifikasi"
 *               message:
 *                 type: string
 *                 example: "System maintenance will be performed tonight"
 *                 description: "Isi pesan notifikasi"
 *               user_id:
 *                 type: integer
 *                 example: 1
 *                 description: "ID user penerima (opsional, jika kosong akan menjadi broadcast)"
 *               type:
 *                 type: string
 *                 enum: [system, booking, payment, promotion]
 *                 default: system
 *                 example: "system"
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *                 default: normal
 *                 example: "high"
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [app, email, sms]
 *                 default: ["app"]
 *                 example: ["app", "email"]
 *               data:
 *                 type: object
 *                 description: "Data tambahan untuk notifikasi"
 *                 example: {}
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
 *                   example: "Notifikasi sistem berhasil dibuat"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     uuid:
 *                       type: string
 *                     title:
 *                       type: string
 *                     message:
 *                       type: string
 *                     type:
 *                       type: string
 *                     priority:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 *         description: Filter berdasarkan role user
 *         example: "supervisor_sistem"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *         description: Filter berdasarkan status user
 *         example: "active"
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter berdasarkan department user
 *         example: "IT"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or employee_id
 *         example: "john"
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, name, email, role]
 *           default: "created_at"
 *         description: Field untuk sorting
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: Urutan sorting
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

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user status 🟡 MANAGEMENT
 *     description: |
 *       Endpoint untuk mengubah status aktif/nonaktif user
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
 *         description: ID user yang akan diubah statusnya
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_active]
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 example: true
 *                 description: Status aktif user (true/false)
 *     responses:
 *       200:
 *         description: Status user berhasil diubah
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
 *                   example: "User status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Update user status (activate/deactivate)
 * @access  Management (manajer_futsal+)
 * @params  { id: user_id }
 * @body    { is_active: boolean }
 */
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
 *           enum: [active, inactive, maintenance]
 *         description: Filter berdasarkan status lapangan
 *         example: "active"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [futsal, indoor, outdoor, synthetic, grass]
 *         description: Filter berdasarkan tipe lapangan
 *         example: "futsal"
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
 *                 enum: [futsal, indoor, outdoor, synthetic, grass]
 *                 default: "futsal"
 *                 example: "futsal"
 *                 description: "Tipe lapangan"
 *               description:
 *                 type: string
 *                 example: "Lapangan futsal indoor dengan rumput sintetis"
 *               price:
 *                 type: number
 *                 example: 100000
 *                 description: "Harga per jam (weekday)"
 *               price_weekend:
 *                 type: number
 *                 example: 120000
 *                 description: "Harga per jam (weekend) - opsional"
 *               price_member:
 *                 type: number
 *                 example: 90000
 *                 description: "Harga per jam untuk member - opsional"
 *               capacity:
 *                 type: integer
 *                 default: 22
 *                 example: 22
 *                 description: "Kapasitas maksimal pemain"
 *               location:
 *                 type: string
 *                 example: "Pekanbaru"
 *                 description: "Lokasi kota/area"
 *               address:
 *                 type: string
 *                 example: "Jl. Futsal No. 123, Pekanbaru"
 *                 description: "Alamat lengkap lapangan"
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["AC", "Sound System", "Lighting", "Parking", "Shower"]
 *                 description: "Fasilitas yang tersedia"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *                 default: "active"
 *                 example: "active"
 *                 description: "Status lapangan"
 *               operating_hours:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     example: "06:00"
 *                   end:
 *                     type: string
 *                     example: "23:00"
 *                 description: "Jam operasional lapangan"
 *               operating_days:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                 example: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
 *                 description: "Hari operasional lapangan"
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
 *
 *       **📝 FIELD ASSIGNMENT:**
 *       - Gunakan field `assigned_operator` untuk menugaskan operator ke lapangan
 *       - Set `assigned_operator: null` untuk menghapus penugasan
 *       - Hanya operator yang ditugaskan yang bisa mengelola booking di lapangan tersebut
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
 *                 enum: [futsal, indoor, outdoor, synthetic, grass]
 *                 example: "futsal"
 *                 description: "Tipe lapangan"
 *               description:
 *                 type: string
 *                 example: "Lapangan futsal indoor dengan fasilitas lengkap"
 *               price:
 *                 type: number
 *                 example: 120000
 *                 description: "Harga per jam (weekday)"
 *               price_weekend:
 *                 type: number
 *                 example: 140000
 *                 description: "Harga per jam (weekend) - opsional"
 *               price_member:
 *                 type: number
 *                 example: 100000
 *                 description: "Harga per jam untuk member - opsional"
 *               capacity:
 *                 type: integer
 *                 example: 22
 *                 description: "Kapasitas maksimal pemain"
 *               location:
 *                 type: string
 *                 example: "Pekanbaru"
 *                 description: "Lokasi kota/area"
 *               address:
 *                 type: string
 *                 example: "Jl. Futsal No. 123, Pekanbaru"
 *                 description: "Alamat lengkap lapangan"
 *               facilities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["AC", "Sound System", "Lighting", "Parking", "Shower"]
 *                 description: "Fasilitas yang tersedia"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, maintenance]
 *                 example: "active"
 *                 description: "Status lapangan"
 *               operating_hours:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     example: "06:00"
 *                   end:
 *                     type: string
 *                     example: "23:00"
 *                 description: "Jam operasional lapangan"
 *               operating_days:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                 example: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
 *                 description: "Hari operasional lapangan"
 *               assigned_operator:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *                 description: "ID operator yang ditugaskan untuk mengelola lapangan ini"
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
 *                     status:
 *                       type: string
 *                       example: "inactive"
 *                       description: "Status lapangan setelah soft delete"
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       description: "Waktu terakhir diupdate"
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

/**
 * @swagger
 * /api/admin/fields/{id}/assign-operator:
 *   put:
 *     tags: [Admin]
 *     summary: Assign operator ke lapangan 🟡 MANAGEMENT
 *     description: |
 *       Endpoint khusus untuk menugaskan operator ke lapangan tertentu
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem)
 *       - ✅ **Manager Futsal** (manajer_futsal)
 *       - ❌ Staff lainnya tidak dapat mengakses
 *
 *       **📝 OPERATOR ASSIGNMENT:**
 *       - Hanya operator yang ditugaskan yang bisa mengelola booking di lapangan
 *       - Set `operator_id: null` untuk menghapus penugasan
 *       - Operator harus memiliki role `operator_lapangan`
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan yang akan ditugaskan operator
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [operator_id]
 *             properties:
 *               operator_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *                 description: "ID operator yang akan ditugaskan (null untuk menghapus penugasan)"
 *     responses:
 *       200:
 *         description: Operator berhasil ditugaskan ke lapangan
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
 *                   example: "Operator assigned to field successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     field_id:
 *                       type: integer
 *                       example: 3
 *                     field_name:
 *                       type: string
 *                       example: "Lapangan Futsal A"
 *                     assigned_operator:
 *                       type: integer
 *                       example: 3
 *                     operator_name:
 *                       type: string
 *                       example: "Operator Lapangan"
 *       400:
 *         description: Bad Request - Operator tidak valid
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
 *                   example: "Invalid operator - must have operator_lapangan role"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   PUT /api/admin/fields/:id/assign-operator
 * @desc    Assign operator to field
 * @access  Management (manajer_futsal+)
 * @params  { id: field_id }
 * @body    { operator_id }
 */
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

/**
 * @swagger
 * /api/admin/operators:
 *   get:
 *     tags: [Admin]
 *     summary: Get daftar operator lapangan 🟡 MANAGEMENT
 *     description: |
 *       Endpoint untuk mendapatkan daftar semua operator lapangan yang tersedia
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
 *         name: available_only
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Hanya tampilkan operator yang belum ditugaskan
 *     responses:
 *       200:
 *         description: Daftar operator berhasil diambil
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
 *                         example: 3
 *                       name:
 *                         type: string
 *                         example: "Operator Lapangan"
 *                       email:
 *                         type: string
 *                         example: "operator@futsal.com"
 *                       employee_id:
 *                         type: string
 *                         example: "OP001"
 *                       assigned_fields:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             field_id:
 *                               type: integer
 *                             field_name:
 *                               type: string
 *                       is_available:
 *                         type: boolean
 *                         example: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * @route   GET /api/admin/operators
 * @desc    Get list of field operators
 * @access  Management (manajer_futsal+)
 * @query   { available_only }
 */
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

module.exports = router;
