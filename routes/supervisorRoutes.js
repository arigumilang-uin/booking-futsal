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

router.get('/dashboard', getSupervisorDashboard);

router.get('/system-health', getSystemHealth);

router.post('/staff', createStaffUser);

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

router.get('/audit-logs', getAuditLogs);

router.get('/system-config', async (req, res) => {
  try {
    res.json({ success: true, data: {
        environment: process.env.NODE_ENV || 'production',
        database_url: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
        jwt_secret: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
        port: process.env.PORT || 5000,
        cors_origins: [
          'http://localhost:3000',
          'http://localhost:5173',
          'https://booking-futsal-frontend.vercel.app'
        ],
        // Monitoring data object
        const monitoringData = {
          features: {
          enhanced_role_system: true,
          auto_generation: true,
          conflict_detection: true,
          payment_gateway: true,
          audit_trail: true,
          jsonb_support: true
          }
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get system config',
        code: 'SYSTEM_CONFIG_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
});

router.post('/system-maintenance', async (req, res) => {
  try {
    const { type, description, scheduled_time, notify_users } = req.body;

    const validTypes = [
      'database_cleanup',
      'system_restart',
      'cache_clear',
      'log_rotation',
      'security_scan'
    ];

    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Invalid maintenance type',
          valid_types: validTypes
        };
        // In production, this would be sent to monitoring service
    }

    if (!description) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Description is required'
        };
        // In production, this would be sent to monitoring service
    }

    // Execute maintenance task based on type
    let result = {};

    switch (type) {
      case 'database_cleanup':
        // Placeholder for database cleanup
        result = { cleaned_records: 0, freed_space: '0 MB' };
        break;
      case 'cache_clear':
        // Placeholder for cache clearing
        result = { cleared_cache_size: '0 MB' };
        break;
      case 'log_rotation':
        // Placeholder for log rotation
        result = { rotated_logs: 0, archived_size: '0 MB' };
        break;
      default:
        result = { message: 'Task scheduled for execution' };
    }

    res.json({
      success: true,
      message: `Maintenance task '${type}' executed successfully`,
      // Monitoring data object
      const monitoringData = {
        data: {
        type,
        description,
        scheduled_time,
        notify_users,
        executed_at: new Date().toISOString(),
        executed_by: req.rawUser.name,
        result
        }
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('System maintenance error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Failed to execute maintenance task',
        error: error.message
      };
      // In production, this would be sent to monitoring service
  }
});

router.get('/database-stats', async (req, res) => {
  try {
    const { getDatabaseStats } = require('../config/db');
    const dbStats = await getDatabaseStats();

    res.json({ success: true, data: dbStats
    });

  } catch (error) {
    console.error('Get database stats error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get database stats',
        code: 'DATABASE_STATS_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
});

router.get('/error-logs', async (req, res) => {
  try {
    const { page = 1, limit = 50, level = 'error' } = req.query;

    // This would be implemented with proper logging system
    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          logs: [],
          pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: 0
          }
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get error logs error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get error logs',
        code: 'ERROR_LOGS_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
});

module.exports = router;
