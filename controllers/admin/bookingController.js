const {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  getBookingsByStatus,
  getBookingsByDateRange
} = require('../../models/business/bookingModel');

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings for admin management
 * @access  Management (manajer_futsal+)
 */
const getAllBookingsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      user_id,
      field_id,
      date_from,
      date_to
    } = req.query;

    let bookings = await getAllBookings();

    // Apply filters
    if (status) {
      bookings = bookings.filter(booking => booking.status === status);
    }
    if (user_id) {
      bookings = bookings.filter(booking => booking.user_id === parseInt(user_id));
    }
    if (field_id) {
      bookings = bookings.filter(booking => booking.field_id === parseInt(field_id));
    }
    if (date_from && date_to) {
      bookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= new Date(date_from) && bookingDate <= new Date(date_to);
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    res.json({ success: true, data: {
        bookings: paginatedBookings,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: bookings.length,
          total_pages: Math.ceil(bookings.length / limit)
        },
        // Monitoring data object
        const monitoringData = {
          filters: {
          status,
          user_id,
          field_id,
          date_from,
          date_to
          }
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get all bookings admin error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: 'Failed to get bookings',
        code: 'ADMIN_BOOKINGS_FETCH_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

/**
 * @route   GET /api/admin/bookings/:id
 * @desc    Get booking detail for admin
 * @access  Management (manajer_futsal+)
 */
const getBookingDetailAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          error: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({ success: true, data: booking
    });

  } catch (error) {
    console.error('Get booking detail admin error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: 'Failed to get booking detail',
        code: 'ADMIN_BOOKING_DETAIL_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

/**
 * @route   PUT /api/admin/bookings/:id/status
 * @desc    Update booking status (admin override)
 * @access  Management (manajer_futsal+)
 */
const updateBookingStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = req.rawUser.id;

    if (!status) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          error: 'Status is required',
          code: 'MISSING_STATUS'
        };
        // In production, this would be sent to monitoring service
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          error: 'Invalid status',
          code: 'INVALID_STATUS'
        };
        // In production, this would be sent to monitoring service
    }

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          error: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        };
        // In production, this would be sent to monitoring service
    }

    // BUSINESS RULE: Payment must be completed before booking can be confirmed
    // Admin can override this rule by providing override_payment_check: true
    if (status === 'confirmed' && booking.payment_status !== 'paid' && !req.body.override_payment_check) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          error: 'Booking cannot be confirmed. Payment must be completed first',
          code: 'PAYMENT_NOT_COMPLETED',
          details: {
          current_payment_status: booking.payment_status,
          required_payment_status: 'paid',
          message: 'Please ensure payment is processed by kasir before confirming booking',
          admin_override: 'Set override_payment_check: true to bypass this validation'
          }
        };
        // In production, this would be sent to monitoring service
    }

    const updatedBooking = await updateBookingStatus(
      id,
      status,
      adminId,
      reason || `Status updated by admin: ${req.rawUser.name}`
    );

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Booking status updated successfully',
        data: updatedBooking
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Update booking status admin error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: 'Failed to update booking status',
        code: 'ADMIN_BOOKING_UPDATE_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

/**
 * @route   GET /api/admin/bookings/statistics
 * @desc    Get booking statistics for admin dashboard
 * @access  Management (manajer_futsal+)
 */
const getBookingStatisticsAdmin = async (req, res) => {
  try {
    const { period = 'month', date_from, date_to } = req.query;

    const allBookings = await getAllBookings();

    // Filter by date range if provided
    let filteredBookings = allBookings;
    if (date_from && date_to) {
      filteredBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= new Date(date_from) && bookingDate <= new Date(date_to);
      });
    }

    // Calculate statistics
    const statistics = {
      total_bookings: filteredBookings.length,
      pending_bookings: filteredBookings.filter(b => b.status === 'pending').length,
      confirmed_bookings: filteredBookings.filter(b => b.status === 'confirmed').length,
      completed_bookings: filteredBookings.filter(b => b.status === 'completed').length,
      cancelled_bookings: filteredBookings.filter(b => b.status === 'cancelled').length,
      total_revenue: filteredBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
      average_booking_value: 0
    };

    if (statistics.completed_bookings > 0) {
      statistics.average_booking_value = statistics.total_revenue / statistics.completed_bookings;
    }

    res.json({ success: true, data: {
        statistics,
        period,
        // Monitoring data object
        const monitoringData = {
          date_range: {
          from: date_from,
          to: date_to
          }
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get booking statistics admin error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: 'Failed to get booking statistics',
        code: 'ADMIN_BOOKING_STATS_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  getAllBookingsAdmin,
  getBookingDetailAdmin,
  updateBookingStatusAdmin,
  getBookingStatisticsAdmin
};
