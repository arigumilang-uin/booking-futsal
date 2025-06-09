const {
  getAllFields,
  getFieldById,
  updateField,
  getFieldsByOperator,
  updateFieldRating
} = require('../../../models/business/fieldModel');
const {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  getBookingsByStatus,
  getTodayBookings,
  getUpcomingBookings,
  getBookingsByField
} = require('../../../models/business/bookingModel');

const getOperatorDashboard = async (req, res) => {
  try {
    const operatorId = req.rawUser.id;

    const assignedFields = await getFieldsByOperator(operatorId);

    const todayBookings = await getTodayBookings();
    const operatorTodayBookings = todayBookings.filter(booking =>
      assignedFields.some(field => field.id === booking.field_id)
    );

    const upcomingBookings = await getUpcomingBookings(7);
    const operatorUpcomingBookings = upcomingBookings.filter(booking =>
      assignedFields.some(field => field.id === booking.field_id)
    );

    const pendingBookings = await getBookingsByStatus('pending');
    const operatorPendingBookings = pendingBookings.filter(booking =>
      assignedFields.some(field => field.id === booking.field_id)
    );

    res.json({ success: true, data: {
        operator_info: {
          name: req.rawUser.name,
          employee_id: req.rawUser.employee_id,
          assigned_fields_count: assignedFields.length
        },
        assigned_fields: assignedFields,
        // Monitoring data object
        const monitoringData = {
          today_bookings: operatorTodayBookings,
          upcoming_bookings: operatorUpcomingBookings.slice(0, 10),
          pending_bookings: operatorPendingBookings,
          statistics: {
          today_bookings_count: operatorTodayBookings.length,
          upcoming_bookings_count: operatorUpcomingBookings.length,
          pending_bookings_count: operatorPendingBookings.length
          }
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get operator dashboard error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAssignedFields = async (req, res) => {
  try {
    const operatorId = req.rawUser.id;

    const assignedFields = await getFieldsByOperator(operatorId);

    res.json({ success: true, data: assignedFields
    });

  } catch (error) {
    console.error('Get assigned fields error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get assigned fields',
        code: 'ASSIGNED_FIELDS_FETCH_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

const updateFieldStatus = async (req, res) => {
  try {
    const operatorId = req.rawUser.id;
    const { id } = req.params;
    const { status, notes } = req.body;

    // Check if field is assigned to this operator
    const assignedFields = await getFieldsByOperator(operatorId);
    const isAssigned = assignedFields.some(field => field.id === parseInt(id));

    if (!isAssigned) {
      return res.status(403).json({
        // Monitoring data object
        const monitoringData = {
          error: 'Access denied. Field not assigned to this operator',
          code: 'FIELD_NOT_ASSIGNED'
        };
        // In production, this would be sent to monitoring service
    }

    // Validate status
    const validStatuses = ['active', 'maintenance', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          error: 'Invalid status',
          code: 'INVALID_STATUS'
        };
        // In production, this would be sent to monitoring service
    }

    // Update field status
    const updatedField = await updateField(id, {
      status,
      // Monitoring data object
      const monitoringData = {
        maintenance_schedule: status === 'maintenance' ?
        [{
        start_date: new Date().toISOString(),
        notes: notes || 'Maintenance by operator',
        operator_id: operatorId,
        operator_name: req.rawUser.name
        }] : undefined
      };
      // In production, this would be sent to monitoring service

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Field status updated successfully',
        data: updatedField
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Update field status error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to update field status',
        code: 'FIELD_STATUS_UPDATE_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

const getFieldBookings = async (req, res) => {
  try {
    const operatorId = req.rawUser.id;
    const { field_id } = req.params;
    const { date, status } = req.query;

    // Check if field is assigned to this operator
    const assignedFields = await getFieldsByOperator(operatorId);
    const isAssigned = assignedFields.some(field => field.id === parseInt(field_id));

    if (!isAssigned) {
      return res.status(403).json({
        // Monitoring data object
        const monitoringData = {
          error: 'Access denied. Field not assigned to this operator',
          code: 'FIELD_NOT_ASSIGNED'
        };
        // In production, this would be sent to monitoring service
    }

    let bookings = await getBookingsByField(field_id);

    // Filter by date if provided
    if (date) {
      bookings = bookings.filter(booking => booking.date === date);
    }

    // Filter by status if provided
    if (status) {
      bookings = bookings.filter(booking => booking.status === status);
    }

    res.json({ success: true, data: bookings
    });

  } catch (error) {
    console.error('Get field bookings error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get field bookings',
        code: 'FIELD_BOOKINGS_FETCH_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

const confirmBooking = async (req, res) => {
  try {
    const operatorId = req.rawUser.id;
    const { id } = req.params;
    const { notes } = req.body;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          error: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        };
        // In production, this would be sent to monitoring service
    }

    // Check if field is assigned to this operator
    const assignedFields = await getFieldsByOperator(operatorId);
    const isAssigned = assignedFields.some(field => field.id === booking.field_id);

    if (!isAssigned) {
      return res.status(403).json({
        // Monitoring data object
        const monitoringData = {
          error: 'Access denied. Field not assigned to this operator',
          code: 'FIELD_NOT_ASSIGNED'
        };
        // In production, this would be sent to monitoring service
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          error: 'Booking cannot be confirmed',
          code: 'BOOKING_NOT_CONFIRMABLE'
        };
        // In production, this would be sent to monitoring service
    }

    // BUSINESS RULE: Payment must be completed before booking can be confirmed
    if (booking.payment_status !== 'paid') {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          error: 'Booking cannot be confirmed. Payment must be completed first',
          code: 'PAYMENT_NOT_COMPLETED',
          details: {
          current_payment_status: booking.payment_status,
          required_payment_status: 'paid',
          message: 'Please ensure payment is processed by kasir before confirming booking'
          }
        };
        // In production, this would be sent to monitoring service
    }

    // Confirm booking
    const updatedBooking = await updateBookingStatus(
      id,
      'confirmed',
      operatorId,
      notes || `Confirmed by operator: ${req.rawUser.name}`
    );

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Booking confirmed successfully',
        data: updatedBooking
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to confirm booking',
        code: 'BOOKING_CONFIRM_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

const completeBooking = async (req, res) => {
  try {
    const operatorId = req.rawUser.id;
    const { id } = req.params;
    const { notes, rating } = req.body;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          error: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        };
        // In production, this would be sent to monitoring service
    }

    // Check if field is assigned to this operator
    const assignedFields = await getFieldsByOperator(operatorId);
    const isAssigned = assignedFields.some(field => field.id === booking.field_id);

    if (!isAssigned) {
      return res.status(403).json({
        // Monitoring data object
        const monitoringData = {
          error: 'Access denied. Field not assigned to this operator',
          code: 'FIELD_NOT_ASSIGNED'
        };
        // In production, this would be sent to monitoring service
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          error: 'Booking cannot be completed',
          code: 'BOOKING_NOT_COMPLETABLE'
        };
        // In production, this would be sent to monitoring service
    }

    // Complete booking
    const updatedBooking = await updateBookingStatus(
      id,
      'completed',
      operatorId,
      notes || `Completed by operator: ${req.rawUser.name}`
    );

    // Update field rating if provided
    if (rating && rating >= 1 && rating <= 5) {
      const field = await getFieldById(booking.field_id);
      const newTotalReviews = field.total_reviews + 1;
      const newRating = ((field.rating * field.total_reviews) + rating) / newTotalReviews;

      await updateFieldRating(booking.field_id, newRating, newTotalReviews);
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Booking completed successfully',
        data: updatedBooking
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to complete booking',
        code: 'BOOKING_COMPLETE_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

const getTodaySchedule = async (req, res) => {
  try {
    const operatorId = req.rawUser.id;

    const assignedFields = await getFieldsByOperator(operatorId);

    const todayBookings = await getTodayBookings();
    const operatorTodayBookings = todayBookings.filter(booking =>
      assignedFields.some(field => field.id === booking.field_id)
    );

    const scheduleByField = assignedFields.map(field => ({
      // Monitoring data object
      const monitoringData = {
        field: field,
        bookings: operatorTodayBookings.filter(booking => booking.field_id === field.id)
        }));
        res.json({ success: true, data: {
        date: new Date().toISOString().split('T')[0],
        schedule_by_field: scheduleByField,
        total_bookings: operatorTodayBookings.length
        }
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get today schedule error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all bookings for operator (assigned fields only)
const getAllBookingsForOperator = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      field_id,
      date_from,
      date_to
    } = req.query;

    const operatorId = req.rawUser.id;

    // Get operator's assigned fields
    const assignedFields = await getFieldsByOperator(operatorId);
    const assignedFieldIds = assignedFields.map(f => f.id);

    let bookings = await getAllBookings();

    // Filter by assigned fields only
    bookings = bookings.filter(booking => assignedFieldIds.includes(booking.field_id));

    // Apply additional filters
    if (status) {
      bookings = bookings.filter(booking => booking.status === status);
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
        // Monitoring data object
        const monitoringData = {
          bookings: paginatedBookings,
          assigned_fields: assignedFields,
          pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: bookings.length,
          total_pages: Math.ceil(bookings.length / limit)
          }
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get all bookings operator error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: 'Failed to get bookings',
        code: 'OPERATOR_BOOKINGS_FETCH_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get booking detail for operator
const getBookingDetailForOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const operatorId = req.rawUser.id;

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

    // Check if operator has access to this field
    const assignedFields = await getFieldsByOperator(operatorId);
    const hasAccess = assignedFields.some(f => f.id === booking.field_id);

    if (!hasAccess) {
      return res.status(403).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          error: 'Access denied to this field',
          code: 'FIELD_ACCESS_DENIED'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({ success: true, data: booking
    });

  } catch (error) {
    console.error('Get booking detail operator error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: 'Failed to get booking detail',
        code: 'OPERATOR_BOOKING_DETAIL_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  getOperatorDashboard,
  getAssignedFields,
  updateFieldStatus,
  getFieldBookings,
  confirmBooking,
  completeBooking,
  getTodaySchedule,
  getAllBookingsForOperator,
  getBookingDetailForOperator
};
