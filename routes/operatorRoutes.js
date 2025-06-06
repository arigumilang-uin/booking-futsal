// routes/operatorRoutes.js - Operator Routes untuk Operator Lapangan Access
const express = require('express');
const router = express.Router();

// Controllers
const {
  getOperatorDashboard,
  getAssignedFields,
  updateFieldStatus,
  getFieldBookings,
  confirmBooking,
  completeBooking,
  getTodaySchedule,
  getAllBookingsForOperator,
  getBookingDetailForOperator
} = require('../controllers/staff/operator/operatorController');

// Middlewares
const { requireAuth } = require('../middlewares/auth/authMiddleware');
const { requireStaff } = require('../middlewares/authorization/roleBasedAccess');

// Apply authentication dan staff role check untuk semua routes
router.use(requireAuth);
router.use(requireStaff);

// =====================================================
// OPERATOR ROUTES - OPERATOR_LAPANGAN ACCESS
// =====================================================

/**
 * @swagger
 * /api/staff/operator/dashboard:
 *   get:
 *     tags: [Staff]
 *     summary: Get dashboard operator lapangan 🟢 STAFF
 *     description: Endpoint untuk mendapatkan dashboard operator dengan statistik dan informasi lapangan yang dikelola
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard operator berhasil diambil
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
 *                     operator_info:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "John Operator"
 *                         employee_id:
 *                           type: string
 *                           example: "OP001"
 *                         assigned_fields:
 *                           type: integer
 *                           example: 3
 *                     today_stats:
 *                       type: object
 *                       properties:
 *                         total_bookings:
 *                           type: integer
 *                           example: 12
 *                         pending_confirmations:
 *                           type: integer
 *                           example: 3
 *                         active_bookings:
 *                           type: integer
 *                           example: 2
 *                     field_status:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field_name:
 *                             type: string
 *                           status:
 *                             type: string
 *                           current_booking:
 *                             type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * @route   GET /api/staff/operator/dashboard
 * @desc    Get operator dashboard
 * @access  Private (Operator, Manager, Supervisor)
 */
router.get('/dashboard', getOperatorDashboard);

/**
 * @swagger
 * /api/staff/operator/fields:
 *   get:
 *     tags: [Staff]
 *     summary: Get lapangan yang ditugaskan 🟢 STAFF
 *     description: Endpoint untuk mendapatkan daftar lapangan yang ditugaskan ke operator
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       current_bookings:
 *                         type: integer
 *                       today_revenue:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * @route   GET /api/staff/operator/fields
 * @desc    Get assigned fields untuk operator
 * @access  Private (Operator, Manager, Supervisor)
 */
router.get('/fields', getAssignedFields);

/**
 * @route   PUT /api/staff/operator/fields/:id/status
 * @desc    Update field status (maintenance, active, etc.)
 * @access  Private (Operator, Manager, Supervisor)
 * @params  { id: field_id }
 * @body    { status, notes }
 */
router.put('/fields/:id/status', updateFieldStatus);

/**
 * @route   GET /api/staff/operator/fields/:field_id/bookings
 * @desc    Get bookings untuk specific field
 * @access  Private (Operator, Manager, Supervisor)
 * @params  { field_id }
 * @query   { date, status }
 */
router.get('/fields/:field_id/bookings', getFieldBookings);

/**
 * @route   GET /api/staff/operator/schedule/today
 * @desc    Get today's schedule untuk assigned fields
 * @access  Private (Operator, Manager, Supervisor)
 */
router.get('/schedule/today', getTodaySchedule);

/**
 * @route   GET /api/staff/operator/today-schedule
 * @desc    Get today's schedule
 * @access  Private (Operator, Manager, Supervisor)
 */
router.get('/today-schedule', async (req, res) => {
  try {
    const operatorId = req.rawUser.id;
    const today = new Date().toISOString().split('T')[0];

    res.json({
      success: true,
      data: {
        date: today,
        operator_info: {
          name: req.rawUser.name,
          employee_id: req.rawUser.employee_id
        },
        schedule_by_field: [],
        total_bookings: 0
      }
    });

  } catch (error) {
    console.error('Get today schedule error:', error);
    res.status(500).json({
      error: 'Failed to get today schedule',
      code: 'TODAY_SCHEDULE_FETCH_FAILED'
    });
  }
});

/**
 * @route   GET /api/staff/operator/schedule/:date
 * @desc    Get schedule untuk specific date
 * @access  Private (Operator, Manager, Supervisor)
 * @params  { date: YYYY-MM-DD }
 */
router.get('/schedule/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const operatorId = req.rawUser.id;
    
    // This would be implemented in controller
    // For now, return basic structure
    res.json({
      success: true,
      data: {
        date: date,
        operator_info: {
          name: req.rawUser.name,
          employee_id: req.rawUser.employee_id
        },
        schedule_by_field: [],
        total_bookings: 0
      }
    });

  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ 
      error: 'Failed to get schedule',
      code: 'SCHEDULE_FETCH_FAILED'
    });
  }
});

/**
 * @swagger
 * /api/staff/operator/bookings/{id}/confirm:
 *   put:
 *     tags: [Staff]
 *     summary: Konfirmasi booking 🟢 STAFF
 *     description: Endpoint untuk mengkonfirmasi booking yang pending
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID booking yang akan dikonfirmasi
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Booking dikonfirmasi, lapangan siap"
 *                 description: "Catatan konfirmasi (opsional)"
 *     responses:
 *       200:
 *         description: Booking berhasil dikonfirmasi
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
 *                   example: "Booking confirmed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking_id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: "confirmed"
 *                     confirmed_at:
 *                       type: string
 *                       format: date-time
 *                     confirmed_by:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   PUT /api/staff/operator/bookings/:id/confirm
 * @desc    Confirm booking
 * @access  Private (Operator, Manager, Supervisor)
 * @params  { id: booking_id }
 * @body    { notes }
 */
router.put('/bookings/:id/confirm', confirmBooking);

/**
 * @route   PUT /api/staff/operator/bookings/:id/complete
 * @desc    Complete booking setelah selesai dimainkan
 * @access  Private (Operator, Manager, Supervisor)
 * @params  { id: booking_id }
 * @body    { notes, rating }
 */
router.put('/bookings/:id/complete', completeBooking);

/**
 * @swagger
 * /api/staff/operator/bookings:
 *   get:
 *     tags: [Staff]
 *     summary: Get semua booking untuk operator 🟢 STAFF
 *     description: Endpoint untuk mendapatkan semua booking yang ditangani operator (hanya lapangan yang ditugaskan)
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
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter berdasarkan status booking
 *       - in: query
 *         name: field_id
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan lapangan
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       booking_number:
 *                         type: string
 *                       field_name:
 *                         type: string
 *                       customer_name:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       start_time:
 *                         type: string
 *                       end_time:
 *                         type: string
 *                       status:
 *                         type: string
 *                       total_amount:
 *                         type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * @route   GET /api/staff/operator/bookings
 * @desc    Get all bookings for operator (assigned fields only)
 * @access  Private (Operator, Manager, Supervisor)
 * @query   { page, limit, status, field_id, date_from, date_to }
 */
router.get('/bookings', getAllBookingsForOperator);

/**
 * @route   GET /api/staff/operator/bookings/:id
 * @desc    Get booking detail for operator
 * @access  Private (Operator, Manager, Supervisor)
 * @params  { id: booking_id }
 */
router.get('/bookings/:id', getBookingDetailForOperator);

/**
 * @route   GET /api/staff/operator/bookings/pending
 * @desc    Get pending bookings yang perlu dikonfirmasi
 * @access  Private (Operator, Manager, Supervisor)
 */
router.get('/bookings/pending', async (req, res) => {
  try {
    const operatorId = req.rawUser.id;

    // This would filter pending bookings for assigned fields
    // For now, return basic structure
    res.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Get pending bookings error:', error);
    res.status(500).json({
      error: 'Failed to get pending bookings',
      code: 'PENDING_BOOKINGS_FETCH_FAILED'
    });
  }
});

/**
 * @route   GET /api/staff/operator/field-statuses
 * @desc    Get available field statuses
 * @access  Private (Operator, Manager, Supervisor)
 */
router.get('/field-statuses', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        value: 'active',
        label: 'Active',
        description: 'Lapangan aktif dan dapat dibooking',
        color: 'green'
      },
      {
        value: 'maintenance',
        label: 'Maintenance',
        description: 'Lapangan sedang maintenance',
        color: 'orange'
      },
      {
        value: 'inactive',
        label: 'Inactive',
        description: 'Lapangan tidak aktif sementara',
        color: 'red'
      }
    ]
  });
});

/**
 * @route   GET /api/staff/operator/booking-actions
 * @desc    Get available booking actions
 * @access  Private (Operator, Manager, Supervisor)
 */
router.get('/booking-actions', (req, res) => {
  res.json({
    success: true,
    data: {
      pending_actions: [
        {
          action: 'confirm',
          label: 'Confirm Booking',
          description: 'Konfirmasi booking customer'
        },
        {
          action: 'cancel',
          label: 'Cancel Booking',
          description: 'Batalkan booking dengan alasan'
        }
      ],
      confirmed_actions: [
        {
          action: 'complete',
          label: 'Complete Booking',
          description: 'Selesaikan booking setelah dimainkan'
        },
        {
          action: 'no_show',
          label: 'Mark No Show',
          description: 'Tandai customer tidak datang'
        }
      ]
    }
  });
});

/**
 * @route   GET /api/staff/operator/statistics
 * @desc    Get operator statistics
 * @access  Private (Operator, Manager, Supervisor)
 */
router.get('/statistics', async (req, res) => {
  try {
    const operatorId = req.rawUser.id;
    const { date_from, date_to } = req.query;
    
    // This would calculate operator statistics
    // For now, return basic structure
    res.json({
      success: true,
      data: {
        period: {
          start_date: date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end_date: date_to || new Date()
        },
        statistics: {
          total_bookings_handled: 0,
          confirmed_bookings: 0,
          completed_bookings: 0,
          no_show_bookings: 0,
          fields_managed: 0,
          average_rating: 0
        }
      }
    });

  } catch (error) {
    console.error('Get operator statistics error:', error);
    res.status(500).json({ 
      error: 'Failed to get operator statistics',
      code: 'OPERATOR_STATS_FAILED'
    });
  }
});

module.exports = router;
