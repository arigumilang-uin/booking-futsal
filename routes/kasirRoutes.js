// routes/kasirRoutes.js - Kasir Routes untuk Staff Kasir Access
const express = require('express');
const router = express.Router();

// Controllers
const {
  getAllPaymentsForKasir,
  getPaymentDetailForKasir,
  processManualPayment,
  confirmPayment,
  getPendingPayments,
  getPaymentStatsForKasir,
  getDailyCashReport,
  getAllBookingsForKasir,
  getBookingDetailForKasir
} = require('../controllers/staff/kasir/kasirController');

// Import for debug endpoint
const { getBookingById } = require('../models/business/bookingModel');

// Middlewares
const { requireAuth } = require('../middlewares/auth/authMiddleware');
const { requireStaff } = require('../middlewares/authorization/roleBasedAccess');

// Apply authentication dan staff role check untuk semua routes
router.use(requireAuth);
router.use(requireStaff);

// =====================================================
// KASIR ROUTES - STAFF_KASIR ACCESS
// =====================================================

router.get('/payments', getAllPaymentsForKasir);

router.get('/payments/pending', getPendingPayments);

router.get('/payments/:id', getPaymentDetailForKasir);

/**
 * @route   GET /api/staff/kasir/pending-payments
 * @desc    Get pending payments
 * @access  Private (Kasir, Manager, Supervisor)
 */
router.get('/pending-payments', getPendingPayments);

router.post('/payments/manual', processManualPayment);

/**
 * @route   POST /api/staff/kasir/payments/debug
 * @desc    Debug payment processing
 * @access  Private (Kasir, Manager, Supervisor)
 */
router.post('/payments/debug', async (req, res) => {
  try {
    const { booking_id } = req.body;

    // Test step by step payment processing
    const { createPayment, updatePaymentStatus } = require('../models/business/paymentModel');
    const { getBookingById, updatePaymentStatus: updateBookingPaymentStatus } = require('../models/business/bookingModel');

    // Step 1: Get booking
    const booking = await getBookingById(booking_id);

    // Step 2: Create payment
    const payment = await createPayment({
      booking_id: booking_id,
      amount: booking.total_amount,
      method: 'cash',
      status: 'paid'
    });

    // Step 3: Skip update payment status (has SQL issue)
    // const updatedPayment = await updatePaymentStatus(payment.id, 'paid', null);

    // Step 4: Update booking payment status
    const updatedBooking = await updateBookingPaymentStatus(parseInt(booking_id), 'paid');

    res.json({
      success: true,
      debug_info: {
        step1_booking: booking,
        step2_payment: payment,
        step3_skipped: 'updatePaymentStatus has SQL issue',
        step4_updated_booking: updatedBooking,
        staff_user: req.rawUser
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

router.put('/payments/:id/confirm', confirmPayment);

router.get('/statistics', getPaymentStatsForKasir);

router.get('/daily-report', getDailyCashReport);

router.get('/bookings', getAllBookingsForKasir);

router.get('/bookings/:id', getBookingDetailForKasir);

router.get('/dashboard', async (req, res) => {
  try {
    // Get kasir dashboard data
    const today = new Date().toISOString().split('T')[0];
    
    // This would call multiple functions to get dashboard data
    // For now, return basic structure
    res.json({
      success: true,
      data: {
        staff_info: {
          name: req.rawUser.name,
          employee_id: req.rawUser.employee_id,
          department: req.rawUser.department,
          role: 'Kasir'
        },
        today_summary: {
          date: today,
          total_transactions: 0,
          total_amount: 0,
          pending_payments: 0,
          cash_payments: 0,
          digital_payments: 0
        },
        recent_transactions: [],
        pending_payments: [],
        quick_stats: {
          this_week_revenue: 0,
          this_month_revenue: 0,
          average_transaction: 0
        }
      }
    });

  } catch (error) {
    console.error('Kasir dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to get kasir dashboard',
      code: 'KASIR_DASHBOARD_FAILED'
    });
  }
});

router.get('/payment-methods', (req, res) => {
  res.json({
    success: true,
    data: {
      manual_methods: [
        {
          value: 'cash',
          label: 'Cash',
          description: 'Pembayaran tunai',
          requires_reference: false
        },
        {
          value: 'bank_transfer',
          label: 'Bank Transfer',
          description: 'Transfer bank manual',
          requires_reference: true
        },
        {
          value: 'debit_card',
          label: 'Debit Card',
          description: 'Kartu debit',
          requires_reference: true
        }
      ],
      digital_methods: [
        {
          value: 'ewallet',
          label: 'E-Wallet',
          description: 'GoPay, OVO, DANA, dll',
          gateway: 'midtrans'
        },
        {
          value: 'virtual_account',
          label: 'Virtual Account',
          description: 'VA Bank',
          gateway: 'midtrans'
        },
        {
          value: 'credit_card',
          label: 'Credit Card',
          description: 'Kartu kredit',
          gateway: 'midtrans'
        }
      ]
    }
  });
});

module.exports = router;
