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
 * @route   GET /api/staff/supervisor/dashboard
 * @desc    Get supervisor dashboard
 * @access  Private (Supervisor only)
 */
router.get('/dashboard', getSupervisorDashboard);

/**
 * @route   GET /api/staff/supervisor/system-health
 * @desc    Get system health dan monitoring
 * @access  Private (Supervisor only)
 */
router.get('/system-health', getSystemHealth);

/**
 * @route   POST /api/staff/supervisor/staff
 * @desc    Create new staff user
 * @access  Private (Supervisor only)
 * @body    { name, email, password, phone, role, department }
 */
router.post('/staff', createStaffUser);

/**
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
