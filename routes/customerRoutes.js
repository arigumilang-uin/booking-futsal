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
 *     summary: Get profil customer
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
 *     summary: Update profil customer
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
 *     summary: Buat booking baru
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
 *     summary: Get daftar booking customer
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
 *     summary: Get daftar booking customer
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
 *     summary: Get riwayat booking customer
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
 *     summary: Get detail booking customer
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
 *     summary: Batalkan booking customer
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
 *     summary: Get dashboard customer
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
 *     tags: [Enhanced Features]
 *     summary: Get notifikasi customer
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
 *     tags: [Enhanced Features]
 *     summary: Get lapangan favorit
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
 *     summary: Get jumlah notifikasi belum dibaca
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
 *     summary: Tandai notifikasi sebagai dibaca
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
 *     summary: Get daftar review customer
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
 *     summary: Buat review baru
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

// REVIEW ROUTES
router.get('/reviews', getUserReviewsList);
router.post('/reviews', createReview);
router.get('/reviews/:id', getReviewDetail);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);
/**
 * @swagger
 * /api/customer/bookings/{bookingId}/can-review:
 *   get:
 *     tags: [Customer]
 *     summary: Cek apakah customer bisa review booking
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
 *     summary: Tambah lapangan ke favorit
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
 *     summary: Hapus lapangan dari favorit
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

// FAVORITES ROUTES
router.get('/favorites', getFavoriteFields);
router.post('/favorites/:fieldId', addFieldToFavorites);
router.delete('/favorites/:fieldId', removeFieldFromFavorites);
router.put('/favorites/:fieldId/toggle', toggleFieldFavorite);
router.get('/favorites/:fieldId/check', checkFieldFavorite);
router.get('/favorites/availability', getFavoritesWithAvailabilityInfo);
router.get('/favorites/statistics', getFavoritesStatistics);
router.get('/favorites/count', getFavoritesCountOnly);
router.get('/recommendations', getRecommendations);

// PROMOTION ROUTES
router.get('/promotions', getAvailablePromotions);
router.get('/promotions/:code', getPromotionDetails);
router.post('/promotions/validate', validatePromotionCode);
router.post('/promotions/apply', applyPromotionToBooking);
router.post('/promotions/calculate', calculateDiscountPreview);

module.exports = router;
