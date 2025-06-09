// routes/customerRoutes.js - Customer Routes untuk Penyewa Access
const express = require('express');
const router = express.Router();

// Controllers
const {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerFields,
  createCustomerBooking,
  getCustomerBookings,
  getCustomerBookingDetail,
  cancelCustomerBooking,
  getCustomerDashboard
} = require('../controllers/customer/customerController');

// Enhanced Features Controllers
const {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  getNotificationStatistics
} = require('../controllers/customer/notificationController');

const {
  getUserReviewsList,
  createReview,
  updateReview,
  deleteReview,
  getReviewDetail,
  checkCanReview
} = require('../controllers/customer/reviewController');

const {
  getFavoriteFields,
  addFieldToFavorites,
  removeFieldFromFavorites,
  toggleFieldFavorite,
  checkFieldFavorite,
  getFavoritesWithAvailabilityInfo,
  getFavoritesStatistics,
  getRecommendations,
  getFavoritesCountOnly
} = require('../controllers/customer/favoritesController');

const {
  getAvailablePromotions,
  getPromotionDetails,
  validatePromotionCode,
  applyPromotionToBooking,
  calculateDiscountPreview
} = require('../controllers/customer/promotionController');

// Middlewares
const { requireAuth } = require('../middlewares/auth/authMiddleware');
const { requireCustomer } = require('../middlewares/authorization/roleBasedAccess');

// Apply authentication dan customer role check untuk semua routes
router.use(requireAuth);
router.use(requireCustomer);

// =====================================================
// CUSTOMER ROUTES - PENYEWA ACCESS
// =====================================================

/**
 * @swagger
 * /api/customer/profile:
 *   get:
 *     tags: [Customer]
 *     summary: Get profil customer 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan profil customer yang sedang login
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profil customer berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * @route   GET /api/customer/profile
 * @desc    Get customer profile
 * @access  Private (Customer only)
 */
router.get('/profile', getCustomerProfile);

/**
 * @swagger
 * /api/customer/profile:
 *   put:
 *     tags: [Customer]
 *     summary: Update profil customer 🔵 CUSTOMER
 *     description: Endpoint untuk mengupdate profil customer yang sedang login
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe Updated"
 *                 description: "Nama lengkap customer"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.updated@example.com"
 *                 description: "Email customer"
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *                 description: "Nomor telepon customer"
 *     responses:
 *       200:
 *         description: Profil berhasil diupdate
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @route   PUT /api/customer/profile
 * @desc    Update customer profile
 * @access  Private (Customer only)
 * @body    { name, email, phone }
 */
router.put('/profile', updateCustomerProfile);

/**
 * @route   GET /api/customer/fields
 * @desc    Get available fields untuk customer
 * @access  Private (Customer only)
 * @query   { page, limit, search, type, location }
 */
router.get('/fields', getCustomerFields);

/**
 * @swagger
 * /api/customer/bookings:
 *   post:
 *     tags: [Customer]
 *     summary: Buat booking baru 🔵 CUSTOMER
 *     description: Endpoint untuk membuat booking lapangan baru
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [field_id, date, start_time, end_time, name, phone]
 *             properties:
 *               field_id:
 *                 type: integer
 *                 example: 1
 *                 description: ID lapangan
 *               date:
 *                 type: string
 *                 format: date
 *                 example: '2024-12-01'
 *                 description: Tanggal booking
 *               start_time:
 *                 type: string
 *                 example: '10:00'
 *                 description: Waktu mulai (HH:MM)
 *               end_time:
 *                 type: string
 *                 example: '12:00'
 *                 description: Waktu selesai (HH:MM)
 *               name:
 *                 type: string
 *                 example: 'John Doe'
 *                 description: Nama pemesan
 *               phone:
 *                 type: string
 *                 example: '081234567890'
 *                 description: Nomor telepon
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 'john@example.com'
 *                 description: Email (opsional)
 *               notes:
 *                 type: string
 *                 example: 'Booking untuk turnamen'
 *                 description: Catatan tambahan
 *     responses:
 *       201:
 *         description: Booking berhasil dibuat
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
 *                   example: 'Booking created successfully'
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: Konflik waktu booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 'Time slot already booked'
 *   get:
 *     tags: [Customer]
 *     summary: Get daftar booking customer 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan semua booking milik customer yang sedang login
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
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter berdasarkan status booking
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
 *                     $ref: '#/components/schemas/Booking'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @route   POST /api/customer/bookings
 * @desc    Create new booking
 * @access  Private (Customer only)
 * @body    { field_id, date, start_time, end_time, name, phone, email, notes }
 */
router.post('/bookings', createCustomerBooking);

/**
 * @swagger
 * /api/customer/bookings:
 *   get:
 *     tags: [Customer]
 *     summary: Get daftar booking customer 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan semua booking milik customer yang sedang login
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
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter berdasarkan status booking
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
 *                     $ref: '#/components/schemas/Booking'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @route   GET /api/customer/bookings
 * @desc    Get customer bookings
 * @access  Private (Customer only)
 * @query   { status, page, limit }
 */
router.get('/bookings', getCustomerBookings);

/**
 * @swagger
 * /api/customer/bookings/history:
 *   get:
 *     tags: [Customer]
 *     summary: Get riwayat booking customer 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan riwayat booking customer dengan pagination dan filter
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
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter berdasarkan status booking
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
 *         description: Riwayat booking berhasil diambil
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
 *                     $ref: '#/components/schemas/Booking'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @route   GET /api/customer/bookings/history
 * @desc    Get customer booking history dengan pagination
 * @access  Private (Customer only)
 * @query   { page, limit, status, date_from, date_to }
 */
router.get('/bookings/history', (req, res) => {
  // Redirect to bookings dengan additional filters
  req.query.include_history = true;
  getCustomerBookings(req, res);
});

/**
 * @swagger
 * /api/customer/bookings/{id}:
 *   get:
 *     tags: [Customer]
 *     summary: Get detail booking customer 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan detail booking berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID booking
 *     responses:
 *       200:
 *         description: Detail booking berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   GET /api/customer/bookings/:id
 * @desc    Get customer booking detail
 * @access  Private (Customer only)
 * @params  { id: booking_id }
 */
router.get('/bookings/:id', getCustomerBookingDetail);

/**
 * @swagger
 * /api/customer/bookings/{id}/cancel:
 *   put:
 *     tags: [Customer]
 *     summary: Batalkan booking customer 🔵 CUSTOMER
 *     description: Endpoint untuk membatalkan booking yang sudah dibuat
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID booking yang akan dibatalkan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Berhalangan hadir"
 *                 description: "Alasan pembatalan"
 *     responses:
 *       200:
 *         description: Booking berhasil dibatalkan
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
 *                   example: "Booking cancelled successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking_id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: "cancelled"
 *                     cancelled_at:
 *                       type: string
 *                       format: date-time
 *                     cancellation_reason:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   PUT /api/customer/bookings/:id/cancel
 * @desc    Cancel customer booking
 * @access  Private (Customer only)
 * @params  { id: booking_id }
 * @body    { reason }
 */
router.put('/bookings/:id/cancel', cancelCustomerBooking);

/**
 * @swagger
 * /api/customer/booking-history:
 *   get:
 *     tags: [Customer]
 *     summary: Get riwayat booking lengkap 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan riwayat booking lengkap customer dengan pagination
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman data
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: Filter berdasarkan status
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
 *         description: Riwayat booking berhasil diambil
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
 *                     $ref: '#/components/schemas/Booking'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @route   GET /api/customer/booking-history
 * @desc    Get customer booking history dengan pagination
 * @access  Private (Customer only)
 * @query   { page, limit, status, date_from, date_to }
 */
router.get('/booking-history', (req, res) => {
  // Redirect to bookings dengan additional filters
  req.query.include_history = true;
  getCustomerBookings(req, res);
});

/**
 * @swagger
 * /api/customer/upcoming-bookings:
 *   get:
 *     tags: [Customer]
 *     summary: Get booking mendatang 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan booking yang akan datang
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Booking mendatang berhasil diambil
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
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @route   GET /api/customer/upcoming-bookings
 * @desc    Get customer upcoming bookings
 * @access  Private (Customer only)
 */
router.get('/upcoming-bookings', (req, res) => {
  // Filter untuk upcoming bookings only
  req.query.status = 'confirmed';
  req.query.upcoming_only = true;
  getCustomerBookings(req, res);
});

/**
 * @swagger
 * /api/customer/dashboard:
 *   get:
 *     tags: [Customer]
 *     summary: Get dashboard customer 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan data dashboard customer dengan statistik booking
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard customer berhasil diambil
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
 *                     customer_info:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         total_bookings:
 *                           type: integer
 *                     booking_stats:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                         confirmed:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                     recent_bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 *                     favorite_fields:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Field'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @route   GET /api/customer/dashboard
 * @desc    Get customer dashboard data
 * @access  Private (Customer only)
 */
router.get('/dashboard', getCustomerDashboard);

// =====================================================
// ENHANCED FEATURES - CUSTOMER ACCESS
// =====================================================

/**
 * @swagger
 * /api/customer/notifications:
 *   get:
 *     tags: [Customer]
 *     summary: Get notifikasi customer 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan daftar notifikasi customer
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
 *         name: unread_only
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Daftar notifikasi berhasil diambil
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
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                       type:
 *                         type: string
 *                       is_read:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @swagger
 * /api/customer/favorites:
 *   get:
 *     tags: [Customer]
 *     summary: Get lapangan favorit 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan daftar lapangan favorit customer
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Daftar favorit berhasil diambil
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
 *                     $ref: '#/components/schemas/Field'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 */

/**
 * @swagger
 * /api/customer/notifications/count:
 *   get:
 *     tags: [Customer]
 *     summary: Get jumlah notifikasi belum dibaca 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan jumlah notifikasi yang belum dibaca
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Jumlah notifikasi berhasil diambil
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
 *                     unread_count:
 *                       type: integer
 *                       example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @swagger
 * /api/customer/notifications/{id}/read:
 *   put:
 *     tags: [Customer]
 *     summary: Tandai notifikasi sebagai dibaca 🔵 CUSTOMER
 *     description: Endpoint untuk menandai notifikasi tertentu sebagai sudah dibaca
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID notifikasi
 *     responses:
 *       200:
 *         description: Notifikasi berhasil ditandai sebagai dibaca
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
 *                   example: "Notification marked as read"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 */

// NOTIFICATION ROUTES
router.get('/notifications', getNotifications);
router.get('/notifications/count', getUnreadNotificationsCount);
router.get('/notifications/unread-count', getUnreadNotificationsCount);
router.put('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.delete('/notifications/:id', deleteUserNotification);
router.get('/notifications/statistics', getNotificationStatistics);

/**
 * @swagger
 * /api/customer/reviews:
 *   get:
 *     tags: [Customer]
 *     summary: Get daftar review customer 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan semua review yang dibuat oleh customer
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
 *         description: Daftar review berhasil diambil
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
 *                       field_name:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags: [Customer]
 *     summary: Buat review baru 🔵 CUSTOMER
 *     description: Endpoint untuk membuat review lapangan setelah booking selesai
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [booking_id, field_id, rating]
 *             properties:
 *               booking_id:
 *                 type: integer
 *                 example: 123
 *               field_id:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Lapangan bagus dan bersih"
 *     responses:
 *       201:
 *         description: Review berhasil dibuat
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
 *                   example: "Review created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     rating:
 *                       type: integer
 *                     comment:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 */

/**
 * @swagger
 * /api/customer/reviews/{id}:
 *   get:
 *     tags: [Customer]
 *     summary: Get detail review 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan detail review berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID review
 *     responses:
 *       200:
 *         description: Detail review berhasil diambil
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
 *                     field_name:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     comment:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Customer]
 *     summary: Update review 🔵 CUSTOMER
 *     description: Endpoint untuk mengupdate review yang sudah dibuat
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: "Lapangan bagus, updated review"
 *     responses:
 *       200:
 *         description: Review berhasil diupdate
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
 *                   example: "Review updated successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Customer]
 *     summary: Hapus review 🔵 CUSTOMER
 *     description: Endpoint untuk menghapus review yang sudah dibuat
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID review
 *     responses:
 *       200:
 *         description: Review berhasil dihapus
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
 *                   example: "Review deleted successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 */

// REVIEW ROUTES
router.get('/reviews', getUserReviewsList);

/**
 * @swagger
 * /api/customer/reviews:
 *   post:
 *     tags: [Customer]
 *     summary: Buat review baru 🔵 CUSTOMER
 *     description: Endpoint untuk membuat review lapangan setelah booking selesai
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [field_id, booking_id, rating, comment]
 *             properties:
 *               field_id:
 *                 type: integer
 *                 example: 1
 *               booking_id:
 *                 type: integer
 *                 example: 123
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Lapangan sangat bagus dan bersih"
 *     responses:
 *       201:
 *         description: Review berhasil dibuat
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
 *                   example: "Review created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/reviews', createReview);
router.get('/reviews/:id', getReviewDetail);

/**
 * @swagger
 * /api/customer/reviews/{id}:
 *   put:
 *     tags: [Customer]
 *     summary: Update review 🔵 CUSTOMER
 *     description: Endpoint untuk mengupdate review yang sudah dibuat
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID review yang akan diupdate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: "Update: Lapangan bagus tapi agak ramai"
 *     responses:
 *       200:
 *         description: Review berhasil diupdate
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
 *                   example: "Review updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/reviews/:id', updateReview);

/**
 * @swagger
 * /api/customer/reviews/{id}:
 *   delete:
 *     tags: [Customer]
 *     summary: Hapus review 🔵 CUSTOMER
 *     description: Endpoint untuk menghapus review yang sudah dibuat
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID review yang akan dihapus
 *     responses:
 *       200:
 *         description: Review berhasil dihapus
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
 *                   example: "Review deleted successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/reviews/:id', deleteReview);
/**
 * @swagger
 * /api/customer/bookings/{bookingId}/can-review:
 *   get:
 *     tags: [Customer]
 *     summary: Cek apakah customer bisa review booking 🔵 CUSTOMER
 *     description: Endpoint untuk mengecek apakah customer dapat memberikan review untuk booking tertentu
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID booking yang akan dicek
 *     responses:
 *       200:
 *         description: Status review berhasil dicek
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
 *                     can_review:
 *                       type: boolean
 *                       example: true
 *                     booking_id:
 *                       type: integer
 *                       example: 123
 *                     booking_status:
 *                       type: string
 *                       example: "completed"
 *                     already_reviewed:
 *                       type: boolean
 *                       example: false
 *                     reason:
 *                       type: string
 *                       example: "Booking completed and not yet reviewed"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/bookings/:bookingId/can-review', checkCanReview);

/**
 * @swagger
 * /api/customer/favorites/{fieldId}:
 *   post:
 *     tags: [Customer]
 *     summary: Tambah lapangan ke favorit 🔵 CUSTOMER
 *     description: Endpoint untuk menambahkan lapangan ke daftar favorit customer
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan yang akan ditambahkan ke favorit
 *     responses:
 *       200:
 *         description: Lapangan berhasil ditambahkan ke favorit
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
 *                   example: "Field added to favorites"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Customer]
 *     summary: Hapus lapangan dari favorit 🔵 CUSTOMER
 *     description: Endpoint untuk menghapus lapangan dari daftar favorit customer
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan yang akan dihapus dari favorit
 *     responses:
 *       200:
 *         description: Lapangan berhasil dihapus dari favorit
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
 *                   example: "Field removed from favorites"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 */

/**
 * @swagger
 * /api/customer/favorites/{fieldId}/toggle:
 *   put:
 *     tags: [Customer]
 *     summary: Toggle status favorit lapangan 🔵 CUSTOMER
 *     description: Endpoint untuk toggle status favorit lapangan (add/remove)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan
 *     responses:
 *       200:
 *         description: Status favorit berhasil di-toggle
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
 *                   example: "Field favorite status toggled"
 *                 data:
 *                   type: object
 *                   properties:
 *                     is_favorite:
 *                       type: boolean
 *                       example: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @swagger
 * /api/customer/favorites/{fieldId}/check:
 *   get:
 *     tags: [Customer]
 *     summary: Cek status favorit lapangan 🔵 CUSTOMER
 *     description: Endpoint untuk mengecek apakah lapangan sudah difavoritkan
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan
 *     responses:
 *       200:
 *         description: Status favorit berhasil dicek
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
 *                     is_favorite:
 *                       type: boolean
 *                       example: true
 *                     field_id:
 *                       type: integer
 *                       example: 1
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @swagger
 * /api/customer/favorites/availability:
 *   get:
 *     tags: [Customer]
 *     summary: Get favorit dengan info ketersediaan 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan lapangan favorit dengan informasi ketersediaan
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: '2024-12-01'
 *         description: Tanggal untuk cek ketersediaan
 *     responses:
 *       200:
 *         description: Favorit dengan ketersediaan berhasil diambil
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
 *                       field_id:
 *                         type: integer
 *                       field_name:
 *                         type: string
 *                       availability:
 *                         type: array
 *                         items:
 *                           type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @swagger
 * /api/customer/favorites/statistics:
 *   get:
 *     tags: [Customer]
 *     summary: Get statistik favorit 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan statistik lapangan favorit customer
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Statistik favorit berhasil diambil
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
 *                     total_favorites:
 *                       type: integer
 *                       example: 5
 *                     most_booked_favorite:
 *                       type: object
 *                     average_rating:
 *                       type: number
 *                       example: 4.5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @swagger
 * /api/customer/favorites/count:
 *   get:
 *     tags: [Customer]
 *     summary: Get jumlah favorit 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan jumlah lapangan favorit customer
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Jumlah favorit berhasil diambil
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
 *                     count:
 *                       type: integer
 *                       example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @swagger
 * /api/customer/recommendations:
 *   get:
 *     tags: [Customer]
 *     summary: Get rekomendasi lapangan 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan rekomendasi lapangan berdasarkan preferensi customer
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Jumlah rekomendasi yang diinginkan
 *     responses:
 *       200:
 *         description: Rekomendasi lapangan berhasil diambil
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
 *                       field_id:
 *                         type: integer
 *                       field_name:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       recommendation_score:
 *                         type: number
 *                       reason:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 */

// FAVORITES ROUTES
router.get('/favorites', getFavoriteFields);
router.post('/favorites/:fieldId', addFieldToFavorites);

/**
 * @swagger
 * /api/customer/favorites/{fieldId}:
 *   delete:
 *     tags: [Customer]
 *     summary: Hapus lapangan dari favorit 🔵 CUSTOMER
 *     description: Endpoint untuk menghapus lapangan dari daftar favorit customer
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan yang akan dihapus dari favorit
 *     responses:
 *       200:
 *         description: Lapangan berhasil dihapus dari favorit
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
 *                   example: "Field removed from favorites successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/favorites/:fieldId', removeFieldFromFavorites);
router.put('/favorites/:fieldId/toggle', toggleFieldFavorite);
router.get('/favorites/:fieldId/check', checkFieldFavorite);
router.get('/favorites/availability', getFavoritesWithAvailabilityInfo);
router.get('/favorites/statistics', getFavoritesStatistics);
router.get('/favorites/count', getFavoritesCountOnly);
router.get('/recommendations', getRecommendations);

/**
 * @swagger
 * /api/customer/promotions:
 *   get:
 *     tags: [Customer]
 *     summary: Get promosi yang tersedia untuk customer 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan daftar promosi yang dapat digunakan customer
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Daftar promosi berhasil diambil
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
 *                       code:
 *                         type: string
 *                       type:
 *                         type: string
 *                       value:
 *                         type: string
 *                       valid_until:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * @swagger
 * /api/customer/promotions/{code}:
 *   get:
 *     tags: [Customer]
 *     summary: Get detail promosi berdasarkan kode 🔵 CUSTOMER
 *     description: Endpoint untuk mendapatkan detail promosi berdasarkan kode promosi
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Kode promosi
 *     responses:
 *       200:
 *         description: Detail promosi berhasil diambil
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
 *                     name:
 *                       type: string
 *                     code:
 *                       type: string
 *                     description:
 *                       type: string
 *                     type:
 *                       type: string
 *                     value:
 *                       type: string
 *                     min_booking_amount:
 *                       type: string
 *                     valid_from:
 *                       type: string
 *                       format: date-time
 *                     valid_until:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @swagger
 * /api/customer/promotions/validate:
 *   post:
 *     tags: [Customer]
 *     summary: Validasi kode promosi 🔵 CUSTOMER
 *     description: Endpoint untuk memvalidasi kode promosi sebelum digunakan
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: "WEEKEND20"
 *               booking_amount:
 *                 type: number
 *                 example: 100000
 *               field_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Validasi promosi berhasil
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
 *                     is_valid:
 *                       type: boolean
 *                       example: true
 *                     discount_amount:
 *                       type: number
 *                       example: 20000
 *                     final_amount:
 *                       type: number
 *                       example: 80000
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */

// PROMOTION ROUTES
router.get('/promotions', getAvailablePromotions);
router.get('/promotions/:code', getPromotionDetails);
router.post('/promotions/validate', validatePromotionCode);
router.post('/promotions/apply', applyPromotionToBooking);
router.post('/promotions/calculate', calculateDiscountPreview);

// PAYMENT ROUTES
const {
  getCustomerPayments,
  getCustomerPaymentDetail,
  createCustomerPayment,
  uploadPaymentProof
} = require('../controllers/customer/paymentController');

/**
 * @swagger
 * /api/customer/payments:
 *   get:
 *     summary: Get customer payments
 *     tags: [Customer Payments]
 *     security:
 *       - bearerAuth: []
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
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, cancelled]
 *     responses:
 *       200:
 *         description: Customer payments retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/payments', getCustomerPayments);

/**
 * @swagger
 * /api/customer/payments/{id}:
 *   get:
 *     summary: Get customer payment detail
 *     tags: [Customer Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment detail retrieved successfully
 *       404:
 *         description: Payment not found
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/payments/:id', getCustomerPaymentDetail);

/**
 * @swagger
 * /api/customer/bookings/{bookingId}/payment:
 *   post:
 *     summary: Create payment for booking
 *     tags: [Customer Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - method
 *               - amount
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [bank_transfer, cash, card]
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: IDR
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Invalid payment data
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/bookings/:bookingId/payment', createCustomerPayment);

/**
 * @swagger
 * /api/customer/payments/{id}/proof:
 *   post:
 *     summary: Upload payment proof
 *     tags: [Customer Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               proof:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Payment proof uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/payments/:id/proof', uploadPaymentProof);

module.exports = router;
