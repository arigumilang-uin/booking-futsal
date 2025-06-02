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
  cancelCustomerBooking
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
  updateFieldReview,
  deleteFieldReview,
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
 * @route   POST /api/customer/bookings
 * @desc    Create new booking
 * @access  Private (Customer only)
 * @body    { field_id, date, start_time, end_time, name, phone, email, notes }
 */
router.post('/bookings', createCustomerBooking);

/**
 * @route   GET /api/customer/bookings
 * @desc    Get customer bookings
 * @access  Private (Customer only)
 * @query   { status, page, limit }
 */
router.get('/bookings', getCustomerBookings);

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
 * @route   GET /api/customer/dashboard
 * @desc    Get customer dashboard data
 * @access  Private (Customer only)
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Get customer statistics
    const userId = req.user.id;
    
    // This would be implemented in controller
    // For now, return basic structure
    res.json({
      success: true,
      data: {
        user_info: {
          name: req.user.name,
          email: req.user.email,
          member_since: req.user.created_at
        },
        statistics: {
          total_bookings: 0,
          completed_bookings: 0,
          cancelled_bookings: 0,
          total_spent: 0
        },
        recent_bookings: [],
        upcoming_bookings: [],
        favorite_fields: []
      }
    });

  } catch (error) {
    console.error('Customer dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get dashboard data',
      code: 'DASHBOARD_FETCH_FAILED'
    });
  }
});

// =====================================================
// ENHANCED FEATURES - CUSTOMER ACCESS
// =====================================================

// NOTIFICATION ROUTES
router.get('/notifications', getNotifications);
router.get('/notifications/count', getUnreadNotificationsCount);
router.put('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);
router.delete('/notifications/:id', deleteUserNotification);
router.get('/notifications/statistics', getNotificationStatistics);

// REVIEW ROUTES
router.get('/reviews', getUserReviewsList);
router.post('/reviews', createReview);
router.get('/reviews/:id', getReviewDetail);
router.put('/reviews/:id', updateFieldReview);
router.delete('/reviews/:id', deleteFieldReview);
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
