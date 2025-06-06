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

/**
 * @swagger
 * /api/staff/manager/dashboard:
 *   get:
 *     tags: [Staff]
 *     summary: Get dashboard manager
 *     description: Endpoint untuk mendapatkan dashboard manager dengan business metrics
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard manager berhasil diambil
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         total_revenue:
 *                           type: string
 *                           example: "50000000.00"
 *                         total_bookings:
 *                           type: integer
 *                           example: 1250
 *                         active_customers:
 *                           type: integer
 *                           example: 350
 *                         field_utilization:
 *                           type: number
 *                           example: 75.5
 *                     today_stats:
 *                       type: object
 *                       properties:
 *                         revenue:
 *                           type: string
 *                         bookings:
 *                           type: integer
 *                         completed_bookings:
 *                           type: integer
 *                     monthly_trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           revenue:
 *                             type: string
 *                           bookings:
 *                             type: integer
 *                     top_fields:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field_name:
 *                             type: string
 *                           revenue:
 *                             type: string
 *                           booking_count:
 *                             type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 * @route   GET /api/staff/manager/bookings
 * @desc    Get all bookings for manager
 * @access  Private (Manager, Supervisor)
 * @query   { page, limit, status, field_id, date_from, date_to }
 */
router.get('/bookings', getAllBookingsForManager);

/**
 * @route   GET /api/staff/manager/bookings/:id
 * @desc    Get booking detail for manager
 * @access  Private (Manager, Supervisor)
 * @params  { id: booking_id }
 */
router.get('/bookings/:id', getBookingDetailForManager);

/**
 * @route   PUT /api/staff/manager/bookings/:id/status
 * @desc    Update booking status
 * @access  Private (Manager, Supervisor)
 * @params  { id: booking_id }
 * @body    { status, reason }
 */
router.put('/bookings/:id/status', updateBookingStatusForManager);

/**
 * @swagger
 * /api/staff/manager/analytics:
 *   get:
 *     tags: [Staff]
 *     summary: Get business analytics
 *     description: Endpoint untuk mendapatkan business analytics untuk manager
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
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
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *         description: Periode analisis
 *     responses:
 *       200:
 *         description: Business analytics berhasil diambil
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
 *                     revenue_analytics:
 *                       type: object
 *                       properties:
 *                         total_revenue:
 *                           type: string
 *                         growth_rate:
 *                           type: number
 *                         period_comparison:
 *                           type: object
 *                     booking_analytics:
 *                       type: object
 *                       properties:
 *                         total_bookings:
 *                           type: integer
 *                         completion_rate:
 *                           type: number
 *                         cancellation_rate:
 *                           type: number
 *                     customer_analytics:
 *                       type: object
 *                       properties:
 *                         new_customers:
 *                           type: integer
 *                         returning_customers:
 *                           type: integer
 *                         customer_retention:
 *                           type: number
 *                     field_performance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field_name:
 *                             type: string
 *                           utilization_rate:
 *                             type: number
 *                           revenue:
 *                             type: string
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                           revenue:
 *                             type: string
 *                           bookings:
 *                             type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
