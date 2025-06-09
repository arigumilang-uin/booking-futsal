// routes/managerRoutes.js - Manager Routes untuk Manajer Futsal Access
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
  getBusinessAnalytics,
  getAllBookingsForManager,
  getBookingDetailForManager,
  updateBookingStatusForManager
} = require('../controllers/staff/manager/managerController');

// Middlewares
const { requireAuth } = require('../middlewares/auth/authMiddleware');
const { requireManagement } = require('../middlewares/authorization/roleBasedAccess');

// Apply authentication dan manager role check untuk semua routes
router.use(requireAuth);
router.use(requireManagement);

// =====================================================
// MANAGER ROUTES - MANAJER_FUTSAL ACCESS
// =====================================================

router.get('/dashboard', getManagerDashboard);

router.get('/users', getAllUsersForManager);

router.put('/users/:id/role', updateUserRoleByManager);

/**
 * @route   PUT /api/staff/manager/users/:id/status
 * @desc    Activate/Deactivate user
 * @access  Private (Manager, Supervisor)
 * @params  { id: user_id }
 * @body    { is_active }
 */
router.put('/users/:id/status', updateUserStatusByManager);

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

router.get('/bookings', getAllBookingsForManager);

router.get('/bookings/:id', getBookingDetailForManager);

/**
 * @route   PUT /api/staff/manager/bookings/:id/status
 * @desc    Update booking status
 * @access  Private (Manager, Supervisor)
 * @params  { id: booking_id }
 * @body    { status, reason }
 */
router.put('/bookings/:id/status', updateBookingStatusForManager);

router.get('/analytics', getBusinessAnalytics);

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
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get revenue report',
        code: 'REVENUE_REPORT_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
});

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
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get booking report',
        code: 'BOOKING_REPORT_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
});

router.get('/staff-performance', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    // This would be implemented with staff performance tracking
    res.json({ success: true, data: {
        period: {
          start_date: date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end_date: date_to || new Date()
        },
        staff_performance: {
          kasir: {
            total_transactions: 0,
            total_amount: 0,
            // Monitoring data object
            const monitoringData = {
              average_processing_time: 0
              },
              operator: {
              total_bookings_handled: 0,
              completion_rate: 0,
              customer_satisfaction: 0
              }
              }
              }
            };
            // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get staff performance error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get staff performance',
        code: 'STAFF_PERFORMANCE_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
});

module.exports = router;
