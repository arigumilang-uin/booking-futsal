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

router.get('/profile', getCustomerProfile);

router.put('/profile', updateCustomerProfile);

/**
 * @route   GET /api/customer/fields
 * @desc    Get available fields untuk customer
 * @access  Private (Customer only)
 * @query   { page, limit, search, type, location }
 */
router.get('/fields', getCustomerFields);

router.post('/bookings', createCustomerBooking);

router.get('/bookings', getCustomerBookings);

router.get('/bookings/history', (req, res) => {
  // Redirect to bookings dengan additional filters
  req.query.include_history = true;
  getCustomerBookings(req, res);
});

router.get('/bookings/:id', getCustomerBookingDetail);

router.put('/bookings/:id/cancel', cancelCustomerBooking);

router.get('/booking-history', (req, res) => {
  // Redirect to bookings dengan additional filters
  req.query.include_history = true;
  getCustomerBookings(req, res);
});

router.get('/upcoming-bookings', (req, res) => {
  // Filter untuk upcoming bookings only
  req.query.status = 'confirmed';
  req.query.upcoming_only = true;
  getCustomerBookings(req, res);
});

router.get('/dashboard', getCustomerDashboard);

// =====================================================
// ENHANCED FEATURES - CUSTOMER ACCESS
// =====================================================

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

// PAYMENT ROUTES
const {
  getCustomerPayments,
  getCustomerPaymentDetail,
  createCustomerPayment,
  uploadPaymentProof
} = require('../controllers/customer/paymentController');

router.get('/payments', getCustomerPayments);

router.get('/payments/:id', getCustomerPaymentDetail);

router.post('/bookings/:bookingId/payment', createCustomerPayment);

router.post('/payments/:id/proof', uploadPaymentProof);

module.exports = router;
