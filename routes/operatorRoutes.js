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

router.get('/dashboard', getOperatorDashboard);

router.get('/fields', getAssignedFields);

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

    res.json({ success: true, data: {
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
    res.json({ success: true, data: {
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

router.put('/bookings/:id/confirm', confirmBooking);

router.put('/bookings/:id/complete', completeBooking);

router.get('/bookings', getAllBookingsForOperator);

router.get('/bookings/:id', getBookingDetailForOperator);

router.get('/bookings/pending', async (req, res) => {
  try {
    const operatorId = req.rawUser.id;

    // This would filter pending bookings for assigned fields
    res.json({ success: true, data: []
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
  res.json({ success: true, data: [
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
  res.json({ success: true, data: {
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
    res.json({ success: true, data: {
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
