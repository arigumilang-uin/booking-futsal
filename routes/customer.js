// routes/customer.js - Customer Routes untuk Penyewa Access
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

// Middlewares
const { authMiddleware } = require('../middlewares/auth/authMiddleware');
const { requireCustomer } = require('../middlewares/roleCheck/roleMiddleware');

// Apply authentication dan customer role check untuk semua routes
router.use(authMiddleware);
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

module.exports = router;
