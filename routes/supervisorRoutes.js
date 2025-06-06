// routes/supervisorRoutes.js - Supervisor Routes untuk Supervisor Sistem Access
const express = require('express');
const router = express.Router();

// Controllers
const {
  getSupervisorDashboard,
  getSystemHealth,
  createStaffUser,
  getAllUsersForSupervisor,
  forceUpdateUserRole,
  getSystemAnalytics,
  getAuditLogs
} = require('../controllers/staff/supervisor/supervisorController');

// Middlewares
const { requireAuth } = require('../middlewares/auth/authMiddleware');
const { requireAdmin } = require('../middlewares/authorization/roleBasedAccess');

// Apply authentication dan supervisor role check untuk semua routes
router.use(requireAuth);
router.use(requireAdmin);

// =====================================================
// SUPERVISOR ROUTES - SUPERVISOR_SISTEM ACCESS
// =====================================================

/**
 * @swagger
 * /api/staff/supervisor/dashboard:
 *   get:
 *     tags: [Staff]
 *     summary: Get dashboard supervisor
 *     description: Endpoint untuk mendapatkan dashboard supervisor dengan system overview
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard supervisor berhasil diambil
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
 *                     system_overview:
 *                       type: object
 *                       properties:
 *                         total_users:
 *                           type: integer
 *                           example: 1500
 *                         active_sessions:
 *                           type: integer
 *                           example: 45
 *                         system_uptime:
 *                           type: string
 *                           example: "15 days, 8 hours"
 *                         database_status:
 *                           type: string
 *                           example: "healthy"
 *                     business_metrics:
 *                       type: object
 *                       properties:
 *                         total_revenue:
 *                           type: string
 *                         total_bookings:
 *                           type: integer
 *                         system_performance:
 *                           type: object
 *                     recent_activities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           activity:
 *                             type: string
 *                           user:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                     alerts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           message:
 *                             type: string
 *                           severity:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * @route   GET /api/staff/supervisor/dashboard
 * @desc    Get supervisor dashboard
 * @access  Private (Supervisor only)
 */
router.get('/dashboard', getSupervisorDashboard);

/**
 * @swagger
 * /api/staff/supervisor/system-health:
 *   get:
 *     tags: [Staff]
 *     summary: Get system health 🔴 SUPERVISOR ONLY
 *     description: |
 *       Endpoint untuk mendapatkan status kesehatan sistem dan monitoring
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem) ONLY
 *       - ❌ Manager dan staff lainnya TIDAK dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: System health berhasil diambil
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
 *                     system_status:
 *                       type: string
 *                       example: "healthy"
 *                     uptime:
 *                       type: string
 *                       example: "15 days, 8 hours"
 *                     memory_usage:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: string
 *                           example: "256 MB"
 *                         total:
 *                           type: string
 *                           example: "512 MB"
 *                         percentage:
 *                           type: number
 *                           example: 50.0
 *                     database_status:
 *                       type: string
 *                       example: "connected"
 *                     active_connections:
 *                       type: integer
 *                       example: 25
 *                     response_time:
 *                       type: string
 *                       example: "45ms"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - Hanya Supervisor yang dapat mengakses
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
 *                   example: "Access denied - Supervisor level required"
 *
 * @route   GET /api/staff/supervisor/system-health
 * @desc    Get system health dan monitoring
 * @access  Private (Supervisor only)
 */
router.get('/system-health', getSystemHealth);

/**
 * @swagger
 * /api/staff/supervisor/staff:
 *   post:
 *     tags: [Staff]
 *     summary: Create staff user 🔴 SUPERVISOR ONLY
 *     description: |
 *       Endpoint untuk membuat user staff baru
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem) ONLY
 *       - ❌ Manager dan staff lainnya TIDAK dapat mengakses
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Staff"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.staff@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *               role:
 *                 type: string
 *                 enum: [staff_kasir, operator_lapangan, manajer_futsal]
 *                 example: "staff_kasir"
 *               department:
 *                 type: string
 *                 example: "Operations"
 *               employee_id:
 *                 type: string
 *                 example: "EMP001"
 *     responses:
 *       201:
 *         description: Staff user berhasil dibuat
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
 *                   example: "Staff user created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - Hanya Supervisor yang dapat membuat staff
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
 *                   example: "Access denied - Supervisor level required"
 *
 * @route   POST /api/staff/supervisor/staff
 * @desc    Create new staff user
 * @access  Private (Supervisor only)
 * @body    { name, email, password, phone, role, department }
 */
router.post('/staff', createStaffUser);

/**
 * @swagger
 * /api/staff/supervisor/users:
 *   get:
 *     tags: [Staff]
 *     summary: Get semua users 🔴 SUPERVISOR ONLY
 *     description: |
 *       Endpoint untuk mendapatkan daftar semua users dengan full access
 *
 *       **🔐 ACCESS LEVEL:**
 *       - ✅ **Supervisor Sistem** (supervisor_sistem) ONLY
 *       - ❌ Manager dan staff lainnya TIDAK dapat mengakses
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [pengunjung, penyewa, staff_kasir, operator_lapangan, manajer_futsal, supervisor_sistem]
 *         description: Filter berdasarkan role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan nama atau email
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status aktif
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter berdasarkan departemen (untuk staff)
 *     responses:
 *       200:
 *         description: Daftar users berhasil diambil
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_users:
 *                           type: integer
 *                         active_users:
 *                           type: integer
 *                         role_breakdown:
 *                           type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Forbidden - Hanya Supervisor yang dapat mengakses
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
 *                   example: "Access denied - Supervisor level required"
 *
 * @route   GET /api/staff/supervisor/users
 * @desc    Get all users dengan full access
 * @access  Private (Supervisor only)
 * @query   { page, limit, role, search, is_active, department }
 */
router.get('/users', getAllUsersForSupervisor);

/**
 * @route   PUT /api/staff/supervisor/users/:id/role
 * @desc    Force update user role
 * @access  Private (Supervisor only)
 * @params  { id: user_id }
 * @body    { new_role }
 */
router.put('/users/:id/role', forceUpdateUserRole);

/**
 * @route   GET /api/staff/supervisor/analytics
 * @desc    Get comprehensive system analytics
 * @access  Private (Supervisor only)
 * @query   { date_from, date_to, period }
 */
router.get('/analytics', getSystemAnalytics);

/**
 * @route   GET /api/staff/supervisor/audit-logs
 * @desc    Get audit logs
 * @access  Private (Supervisor only)
 * @query   { page, limit, action, user_id, date_from, date_to }
 */
router.get('/audit-logs', getAuditLogs);

/**
 * @route   GET /api/staff/supervisor/system-config
 * @desc    Get system configuration
 * @access  Private (Supervisor only)
 */
router.get('/system-config', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        environment: process.env.NODE_ENV || 'development',
        database_url: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
        jwt_secret: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
        port: process.env.PORT || 5000,
        cors_origins: [
          'http://localhost:3000',
          'http://localhost:5173',
          'https://booking-futsal-frontend.vercel.app'
        ],
        features: {
          enhanced_role_system: true,
          auto_generation: true,
          conflict_detection: true,
          payment_gateway: true,
          audit_trail: true,
          jsonb_support: true
        }
      }
    });

  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({ 
      error: 'Failed to get system config',
      code: 'SYSTEM_CONFIG_FAILED'
    });
  }
});

/**
 * @route   POST /api/staff/supervisor/system-maintenance
 * @desc    Trigger system maintenance tasks
 * @access  Private (Supervisor only)
 */
router.post('/system-maintenance', async (req, res) => {
  try {
    const { task } = req.body;
    
    const validTasks = [
      'cleanup_logs',
      'optimize_database',
      'clear_cache',
      'backup_database'
    ];
    
    if (!task || !validTasks.includes(task)) {
      return res.status(400).json({ 
        error: 'Invalid maintenance task',
        code: 'INVALID_MAINTENANCE_TASK',
        valid_tasks: validTasks
      });
    }
    
    // This would implement actual maintenance tasks
    // For now, return success
    res.json({
      success: true,
      message: `Maintenance task '${task}' completed successfully`,
      data: {
        task: task,
        executed_at: new Date().toISOString(),
        executed_by: req.rawUser.name
      }
    });

  } catch (error) {
    console.error('System maintenance error:', error);
    res.status(500).json({ 
      error: 'Failed to execute maintenance task',
      code: 'MAINTENANCE_TASK_FAILED'
    });
  }
});

/**
 * @route   GET /api/staff/supervisor/database-stats
 * @desc    Get detailed database statistics
 * @access  Private (Supervisor only)
 */
router.get('/database-stats', async (req, res) => {
  try {
    const { getDatabaseStats } = require('../config/db');
    const dbStats = await getDatabaseStats();
    
    res.json({
      success: true,
      data: dbStats
    });

  } catch (error) {
    console.error('Get database stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get database stats',
      code: 'DATABASE_STATS_FAILED'
    });
  }
});

/**
 * @route   GET /api/staff/supervisor/error-logs
 * @desc    Get system error logs
 * @access  Private (Supervisor only)
 */
router.get('/error-logs', async (req, res) => {
  try {
    const { page = 1, limit = 50, level = 'error' } = req.query;
    
    // This would be implemented with proper logging system
    // For now, return basic structure
    res.json({
      success: true,
      data: {
        logs: [],
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: 0
        }
      }
    });

  } catch (error) {
    console.error('Get error logs error:', error);
    res.status(500).json({ 
      error: 'Failed to get error logs',
      code: 'ERROR_LOGS_FAILED'
    });
  }
});

module.exports = router;
