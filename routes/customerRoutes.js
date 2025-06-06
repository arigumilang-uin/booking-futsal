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
 * @route   GET /api/customer/bookings/:id
 * @desc    Get customer booking detail
 * @access  Private (Customer only)
 * @params  { id: booking_id }
 */
router.get('/bookings/:id', getCustomerBookingDetail);

/**
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

// NOTIFICATION ROUTES
router.get('/notifications', getNotifications);
router.get('/notifications/count', getUnreadNotificationsCount);
router.get('/notifications/unread-count', getUnreadNotificationsCount);
router.put('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.delete('/notifications/:id', deleteUserNotification);
router.get('/notifications/statistics', getNotificationStatistics);

// REVIEW ROUTES
router.get('/reviews', getUserReviewsList);
router.post('/reviews', createReview);
router.get('/reviews/:id', getReviewDetail);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);
router.get('/bookings/:bookingId/can-review', checkCanReview);

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
