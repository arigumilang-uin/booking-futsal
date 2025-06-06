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

/**
 * @swagger
 * /api/staff/kasir/payments:
 *   get:
 *     tags: [Staff]
 *     summary: Get daftar pembayaran untuk kasir 🟢 STAFF
 *     description: Endpoint untuk mendapatkan semua pembayaran yang perlu diproses kasir
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed]
 *         description: Filter berdasarkan status pembayaran
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [cash, bank_transfer, debit_card]
 *         description: Filter berdasarkan metode pembayaran
 *     responses:
 *       200:
 *         description: Daftar pembayaran berhasil diambil
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
 *                       payment_number:
 *                         type: string
 *                         example: 'PAY-20241201-001'
 *                       booking_id:
 *                         type: integer
 *                       amount:
 *                         type: string
 *                       method:
 *                         type: string
 *                       status:
 *                         type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * @route   GET /api/staff/kasir/payments
 * @desc    Get all payments untuk kasir
 * @access  Private (Kasir, Manager, Supervisor)
 * @query   { page, limit, status, method, date_from, date_to }
 */
router.get('/payments', getAllPaymentsForKasir);

/**
 * @swagger
 * /api/staff/kasir/payments/pending:
 *   get:
 *     tags: [Staff]
 *     summary: Get pembayaran pending 🟢 STAFF
 *     description: Endpoint untuk mendapatkan daftar pembayaran yang masih pending
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
 *     responses:
 *       200:
 *         description: Daftar pembayaran pending berhasil diambil
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
 *                       payment_number:
 *                         type: string
 *                       amount:
 *                         type: string
 *                       method:
 *                         type: string
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       booking_id:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * @route   GET /api/staff/kasir/payments/pending
 * @desc    Get pending payments yang perlu diproses
 * @access  Private (Kasir, Manager, Supervisor)
 */
router.get('/payments/pending', getPendingPayments);

/**
 * @swagger
 * /api/staff/kasir/payments/{id}:
 *   get:
 *     tags: [Staff]
 *     summary: Get detail pembayaran 🟢 STAFF
 *     description: Endpoint untuk mendapatkan detail pembayaran berdasarkan ID untuk kasir
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pembayaran
 *     responses:
 *       200:
 *         description: Detail pembayaran berhasil diambil
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
 *                     id:
 *                       type: integer
 *                     payment_number:
 *                       type: string
 *                     booking_id:
 *                       type: integer
 *                     amount:
 *                       type: string
 *                     method:
 *                       type: string
 *                     status:
 *                       type: string
 *                     customer_name:
 *                       type: string
 *                     field_name:
 *                       type: string
 *                     booking_date:
 *                       type: string
 *                       format: date
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     confirmed_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   GET /api/staff/kasir/payments/:id
 * @desc    Get payment detail untuk kasir
 * @access  Private (Kasir, Manager, Supervisor)
 * @params  { id: payment_id }
 */
router.get('/payments/:id', getPaymentDetailForKasir);

/**
 * @route   GET /api/staff/kasir/pending-payments
 * @desc    Get pending payments
 * @access  Private (Kasir, Manager, Supervisor)
 */
router.get('/pending-payments', getPendingPayments);

/**
 * @swagger
 * /api/staff/kasir/payments/manual:
 *   post:
 *     tags: [Staff]
 *     summary: Proses pembayaran manual
 *     description: Endpoint untuk memproses pembayaran manual (cash, transfer)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [booking_id, method, amount]
 *             properties:
 *               booking_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID booking
 *               method:
 *                 type: string
 *                 enum: [cash, bank_transfer, debit_card]
 *                 description: Metode pembayaran
 *               amount:
 *                 type: string
 *                 example: '200000.00'
 *                 description: Jumlah pembayaran
 *               reference_number:
 *                 type: string
 *                 example: 'TRF123456'
 *                 description: Nomor referensi (untuk non-cash)
 *               notes:
 *                 type: string
 *                 description: Catatan pembayaran
 *     responses:
 *       201:
 *         description: Pembayaran berhasil diproses
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
 *                   example: 'Payment processed successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment_number:
 *                       type: string
 *                       example: 'PAY-20241201-001'
 *                     amount:
 *                       type: string
 *                     method:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * @route   POST /api/staff/kasir/payments/manual
 * @desc    Process manual payment (cash, transfer)
 * @access  Private (Kasir, Manager, Supervisor)
 * @body    { booking_id, method, amount, notes, reference_number }
 */
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

/**
 * @swagger
 * /api/staff/kasir/payments/{id}/confirm:
 *   put:
 *     tags: [Staff]
 *     summary: Konfirmasi pembayaran
 *     description: Endpoint untuk mengkonfirmasi pembayaran yang sudah diterima
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pembayaran yang akan dikonfirmasi
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Pembayaran cash diterima"
 *                 description: "Catatan konfirmasi pembayaran"
 *     responses:
 *       200:
 *         description: Pembayaran berhasil dikonfirmasi
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
 *                   example: "Payment confirmed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     confirmed_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   PUT /api/staff/kasir/payments/:id/confirm
 * @desc    Confirm pending payment
 * @access  Private (Kasir, Manager, Supervisor)
 * @params  { id: payment_id }
 * @body    { notes }
 */
router.put('/payments/:id/confirm', confirmPayment);

/**
 * @swagger
 * /api/staff/kasir/statistics:
 *   get:
 *     tags: [Staff]
 *     summary: Get statistik pembayaran
 *     description: Endpoint untuk mendapatkan statistik pembayaran untuk kasir
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
 *     responses:
 *       200:
 *         description: Statistik pembayaran berhasil diambil
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
 *                     total_payments:
 *                       type: integer
 *                       example: 150
 *                     total_amount:
 *                       type: string
 *                       example: "15000000.00"
 *                     completed_payments:
 *                       type: integer
 *                       example: 140
 *                     pending_payments:
 *                       type: integer
 *                       example: 10
 *                     payment_methods:
 *                       type: object
 *                       properties:
 *                         cash:
 *                           type: integer
 *                         transfer:
 *                           type: integer
 *                         ewallet:
 *                           type: integer
 *                     daily_revenue:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           amount:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 * @route   GET /api/staff/kasir/bookings
 * @desc    Get all bookings for kasir (payment related)
 * @access  Private (Kasir, Manager, Supervisor)
 * @query   { page, limit, payment_status, date_from, date_to }
 */
router.get('/bookings', getAllBookingsForKasir);

/**
 * @route   GET /api/staff/kasir/bookings/:id
 * @desc    Get booking detail for kasir (payment related)
 * @access  Private (Kasir, Manager, Supervisor)
 * @params  { id: booking_id }
 */
router.get('/bookings/:id', getBookingDetailForKasir);

/**
 * @swagger
 * /api/staff/kasir/dashboard:
 *   get:
 *     tags: [Staff]
 *     summary: Get dashboard kasir
 *     description: Endpoint untuk mendapatkan dashboard kasir dengan statistik pembayaran
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard kasir berhasil diambil
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
 *                     staff_info:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Jane Kasir"
 *                         employee_id:
 *                           type: string
 *                           example: "KS001"
 *                         role:
 *                           type: string
 *                           example: "Kasir"
 *                     today_summary:
 *                       type: object
 *                       properties:
 *                         total_transactions:
 *                           type: integer
 *                           example: 15
 *                         total_amount:
 *                           type: string
 *                           example: "3500000.00"
 *                         pending_payments:
 *                           type: integer
 *                           example: 3
 *                         cash_payments:
 *                           type: integer
 *                           example: 8
 *                         digital_payments:
 *                           type: integer
 *                           example: 7
 *                     recent_transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           payment_number:
 *                             type: string
 *                           amount:
 *                             type: string
 *                           method:
 *                             type: string
 *                           status:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
 * @swagger
 * /api/staff/kasir/payment-methods:
 *   get:
 *     tags: [Staff]
 *     summary: Get metode pembayaran yang tersedia
 *     description: Endpoint untuk mendapatkan daftar metode pembayaran yang dapat diproses kasir
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Daftar metode pembayaran berhasil diambil
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
 *                     manual_methods:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "cash"
 *                           label:
 *                             type: string
 *                             example: "Cash"
 *                           description:
 *                             type: string
 *                             example: "Pembayaran tunai"
 *                           requires_reference:
 *                             type: boolean
 *                             example: false
 *                     digital_methods:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             example: "ewallet"
 *                           label:
 *                             type: string
 *                             example: "E-Wallet"
 *                           description:
 *                             type: string
 *                             example: "GoPay, OVO, DANA, dll"
 *                           gateway:
 *                             type: string
 *                             example: "midtrans"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
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
