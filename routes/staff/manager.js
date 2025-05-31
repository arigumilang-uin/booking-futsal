// routes/staff/manager.js - Manager Routes untuk Manajer Futsal Access
const express = require('express');
const router = express.Router();

// Controllers
const { 
  getManagerDashboard,
  getAllUsersForManager,
  updateUserRoleByManager,
  updateUserStatusByManager,
  getAllFieldsForManager,
  createFieldByManager,
  updateFieldByManager,
  getBusinessAnalytics
} = require('../../controllers/staff/manager/managerController');

// Middlewares
const { authMiddleware } = require('../../middlewares/auth/authMiddleware');
const { requireManager } = require('../../middlewares/roleCheck/roleMiddleware');

// Apply authentication dan manager role check untuk semua routes
router.use(authMiddleware);
router.use(requireManager);

// =====================================================
// MANAGER ROUTES - MANAJER_FUTSAL ACCESS
// =====================================================

/**
 * @route   GET /api/staff/manager/dashboard
 * @desc    Get manager dashboard
 * @access  Private (Manager, Supervisor)
 */
router.get('/dashboard', getManagerDashboard);

/**
 * @route   GET /api/staff/manager/users
 * @desc    Get all users untuk management
 * @access  Private (Manager, Supervisor)
 * @query   { page, limit, role, search, is_active }
 */
router.get('/users', getAllUsersForManager);

/**
 * @route   PUT /api/staff/manager/users/:id/role
 * @desc    Update user role
 * @access  Private (Manager, Supervisor)
 * @params  { id: user_id }
 * @body    { new_role }
 */
router.put('/users/:id/role', updateUserRoleByManager);

/**
 * @route   PUT /api/staff/manager/users/:id/status
 * @desc    Activate/Deactivate user
 * @access  Private (Manager, Supervisor)
 * @params  { id: user_id }
 * @body    { is_active }
 */
router.put('/users/:id/status', updateUserStatusByManager);

/**
 * @route   GET /api/staff/manager/fields
 * @desc    Get all fields untuk management
 * @access  Private (Manager, Supervisor)
 */
router.get('/fields', getAllFieldsForManager);

/**
 * @route   POST /api/staff/manager/fields
 * @desc    Create new field
 * @access  Private (Manager, Supervisor)
 * @body    { name, type, description, capacity, location, price, etc. }
 */
router.post('/fields', createFieldByManager);

/**
 * @route   PUT /api/staff/manager/fields/:id
 * @desc    Update field
 * @access  Private (Manager, Supervisor)
 * @params  { id: field_id }
 * @body    { field_data }
 */
router.put('/fields/:id', updateFieldByManager);

/**
 * @route   GET /api/staff/manager/analytics
 * @desc    Get business analytics
 * @access  Private (Manager, Supervisor)
 * @query   { date_from, date_to, period }
 */
router.get('/analytics', getBusinessAnalytics);

/**
 * @route   GET /api/staff/manager/reports/revenue
 * @desc    Get revenue report
 * @access  Private (Manager, Supervisor)
 */
router.get('/reports/revenue', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    // This would be implemented with detailed revenue reporting
    // For now, redirect to analytics
    req.query.period = 'custom';
    getBusinessAnalytics(req, res);

  } catch (error) {
    console.error('Get revenue report error:', error);
    res.status(500).json({ 
      error: 'Failed to get revenue report',
      code: 'REVENUE_REPORT_FAILED'
    });
  }
});

/**
 * @route   GET /api/staff/manager/reports/bookings
 * @desc    Get booking report
 * @access  Private (Manager, Supervisor)
 */
router.get('/reports/bookings', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    // This would be implemented with detailed booking reporting
    // For now, redirect to analytics
    req.query.period = 'custom';
    getBusinessAnalytics(req, res);

  } catch (error) {
    console.error('Get booking report error:', error);
    res.status(500).json({ 
      error: 'Failed to get booking report',
      code: 'BOOKING_REPORT_FAILED'
    });
  }
});

/**
 * @route   GET /api/staff/manager/staff-performance
 * @desc    Get staff performance metrics
 * @access  Private (Manager, Supervisor)
 */
router.get('/staff-performance', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    // This would be implemented with staff performance tracking
    // For now, return basic structure
    res.json({
      success: true,
      data: {
        period: {
          start_date: date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end_date: date_to || new Date()
        },
        staff_performance: {
          kasir: {
            total_transactions: 0,
            total_amount: 0,
            average_processing_time: 0
          },
          operator: {
            total_bookings_handled: 0,
            completion_rate: 0,
            customer_satisfaction: 0
          }
        }
      }
    });

  } catch (error) {
    console.error('Get staff performance error:', error);
    res.status(500).json({ 
      error: 'Failed to get staff performance',
      code: 'STAFF_PERFORMANCE_FAILED'
    });
  }
});

module.exports = router;
