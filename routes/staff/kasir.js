// routes/staff/kasir.js - Kasir Routes untuk Staff Kasir Access
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
  getDailyCashReport
} = require('../../controllers/staff/kasir/kasirController');

// Middlewares
const { authMiddleware } = require('../../middlewares/auth/authMiddleware');
const { requireKasir } = require('../../middlewares/roleCheck/roleMiddleware');

// Apply authentication dan kasir role check untuk semua routes
router.use(authMiddleware);
router.use(requireKasir);

// =====================================================
// KASIR ROUTES - STAFF_KASIR ACCESS
// =====================================================

/**
 * @route   GET /api/staff/kasir/payments
 * @desc    Get all payments untuk kasir
 * @access  Private (Kasir, Manager, Supervisor)
 * @query   { page, limit, status, method, date_from, date_to }
 */
router.get('/payments', getAllPaymentsForKasir);

/**
 * @route   GET /api/staff/kasir/payments/pending
 * @desc    Get pending payments yang perlu diproses
 * @access  Private (Kasir, Manager, Supervisor)
 */
router.get('/payments/pending', getPendingPayments);

/**
 * @route   GET /api/staff/kasir/payments/:id
 * @desc    Get payment detail untuk kasir
 * @access  Private (Kasir, Manager, Supervisor)
 * @params  { id: payment_id }
 */
router.get('/payments/:id', getPaymentDetailForKasir);

/**
 * @route   POST /api/staff/kasir/payments/manual
 * @desc    Process manual payment (cash, transfer)
 * @access  Private (Kasir, Manager, Supervisor)
 * @body    { booking_id, method, amount, notes, reference_number }
 */
router.post('/payments/manual', processManualPayment);

/**
 * @route   PUT /api/staff/kasir/payments/:id/confirm
 * @desc    Confirm pending payment
 * @access  Private (Kasir, Manager, Supervisor)
 * @params  { id: payment_id }
 * @body    { notes }
 */
router.put('/payments/:id/confirm', confirmPayment);

/**
 * @route   GET /api/staff/kasir/statistics
 * @desc    Get payment statistics untuk kasir
 * @access  Private (Kasir, Manager, Supervisor)
 * @query   { date_from, date_to }
 */
router.get('/statistics', getPaymentStatsForKasir);

/**
 * @route   GET /api/staff/kasir/daily-report
 * @desc    Get daily cash report
 * @access  Private (Kasir, Manager, Supervisor)
 * @query   { date }
 */
router.get('/daily-report', getDailyCashReport);

/**
 * @route   GET /api/staff/kasir/dashboard
 * @desc    Get kasir dashboard
 * @access  Private (Kasir, Manager, Supervisor)
 */
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

/**
 * @route   GET /api/staff/kasir/payment-methods
 * @desc    Get available payment methods
 * @access  Private (Kasir, Manager, Supervisor)
 */
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
