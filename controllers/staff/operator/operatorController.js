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
    console.log(`🔍 OPERATOR DASHBOARD - Loading for operator ID: ${operatorId}`);

    // Debug: Get all bookings first
    const { getAllBookings } = require('../../../models/business/bookingModel');
    try {
      const allBookings = await getAllBookings();
      console.log(`🔍 OPERATOR DASHBOARD - Total bookings in database: ${allBookings.length}`);
      console.log(`🔍 OPERATOR DASHBOARD - All bookings:`, allBookings.map(b => ({
        id: b.id,
        field_id: b.field_id,
        field_name: b.field_name,
        status: b.status,
        payment_status: b.payment_status,
        date: b.date
      })));
    } catch (error) {
      console.error('❌ Error getting all bookings for debug:', error);
    }

    // Step 1: Get assigned fields
    let assignedFields = [];
    try {
      assignedFields = await getFieldsByOperator(operatorId);
      console.log(`📍 OPERATOR DASHBOARD - Assigned fields: ${assignedFields.length}`);
      console.log(`📍 OPERATOR DASHBOARD - Field IDs:`, assignedFields.map(f => ({ id: f.id, name: f.name })));
    } catch (error) {
      console.error('❌ Error getting assigned fields:', error);
      assignedFields = [];
    }

    // Step 2: Get today's bookings
    let todayBookings = [];
    let operatorTodayBookings = [];
    try {
      todayBookings = await getTodayBookings();
      console.log(`📅 OPERATOR DASHBOARD - All today bookings:`, todayBookings.map(b => ({ id: b.id, field_id: b.field_id, field_name: b.field_name })));

      operatorTodayBookings = todayBookings.filter(booking =>
        assignedFields.some(field => field.id === booking.field_id)
      );
      console.log(`📅 OPERATOR DASHBOARD - Today bookings: ${operatorTodayBookings.length}/${todayBookings.length}`);
      console.log(`📅 OPERATOR DASHBOARD - Operator today bookings:`, operatorTodayBookings.map(b => ({ id: b.id, field_id: b.field_id, field_name: b.field_name })));
    } catch (error) {
      console.error('❌ Error getting today bookings:', error);
      todayBookings = [];
      operatorTodayBookings = [];
    }

    // Step 3: Get upcoming bookings
    let upcomingBookings = [];
    let operatorUpcomingBookings = [];
    try {
      upcomingBookings = await getUpcomingBookings(7);
      operatorUpcomingBookings = upcomingBookings.filter(booking =>
        assignedFields.some(field => field.id === booking.field_id)
      );
      console.log(`📈 OPERATOR DASHBOARD - Upcoming bookings: ${operatorUpcomingBookings.length}/${upcomingBookings.length}`);
    } catch (error) {
      console.error('❌ Error getting upcoming bookings:', error);
      upcomingBookings = [];
      operatorUpcomingBookings = [];
    }

    // Step 4: Get pending bookings
    let pendingBookings = [];
    let operatorPendingBookings = [];
    try {
      pendingBookings = await getBookingsByStatus('pending');
      console.log(`⏳ OPERATOR DASHBOARD - All pending bookings:`, pendingBookings.map(b => ({ id: b.id, field_id: b.field_id, field_name: b.field_name, status: b.status, payment_status: b.payment_status })));

      operatorPendingBookings = pendingBookings.filter(booking =>
        assignedFields.some(field => field.id === booking.field_id)
      );
      console.log(`⏳ OPERATOR DASHBOARD - Pending bookings: ${operatorPendingBookings.length}/${pendingBookings.length}`);
      console.log(`⏳ OPERATOR DASHBOARD - Operator pending bookings:`, operatorPendingBookings.map(b => ({ id: b.id, field_id: b.field_id, field_name: b.field_name, status: b.status, payment_status: b.payment_status })));
    } catch (error) {
      console.error('❌ Error getting pending bookings:', error);
      pendingBookings = [];
      operatorPendingBookings = [];
    }

    const dashboardData = {
      operator_info: {
        name: req.rawUser.name,
        employee_id: req.rawUser.employee_id,
        assigned_fields_count: assignedFields.length
      },
      assigned_fields: assignedFields,
      today_bookings: operatorTodayBookings,
      upcoming_bookings: operatorUpcomingBookings.slice(0, 10),
      pending_bookings: operatorPendingBookings,
      statistics: {
        today_bookings_count: operatorTodayBookings.length,
        upcoming_bookings_count: operatorUpcomingBookings.length,
        pending_bookings_count: operatorPendingBookings.length
      }
    };

    console.log(`✅ OPERATOR DASHBOARD - Success for ${req.rawUser.name}`);
    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Get operator dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get operator dashboard',
      details: error.message
    });
  }
};

const getAssignedFields = async (req, res) => {
  try {
    const operatorId = req.rawUser.id;

    const assignedFields = await getFieldsByOperator(operatorId);

    res.json({
      success: true,
      data: assignedFields
    });

  } catch (error) {
    console.error('Get assigned fields error:', error);
    res.status(500).json({
      error: 'Failed to get assigned fields',
      code: 'ASSIGNED_FIELDS_FETCH_FAILED'
    });
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
        error: 'Access denied. Field not assigned to this operator',
        code: 'FIELD_NOT_ASSIGNED'
      });
    }

    // Validate status
    const validStatuses = ['active', 'maintenance', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        code: 'INVALID_STATUS'
      });
    }

    // Update field status
    const updatedField = await updateField(id, {
      status,
      maintenance_schedule: status === 'maintenance' ?
        [{
          start_date: new Date().toISOString(),
          notes: notes || 'Maintenance by operator',
          operator_id: operatorId,
          operator_name: req.rawUser.name
        }] : undefined
    });

    res.json({
      success: true,
      message: 'Field status updated successfully',
      data: updatedField
    });

  } catch (error) {
    console.error('Update field status error:', error);
    res.status(500).json({
      error: 'Failed to update field status',
      code: 'FIELD_STATUS_UPDATE_FAILED'
    });
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
        error: 'Access denied. Field not assigned to this operator',
        code: 'FIELD_NOT_ASSIGNED'
      });
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

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Get field bookings error:', error);
    res.status(500).json({
      error: 'Failed to get field bookings',
      code: 'FIELD_BOOKINGS_FETCH_FAILED'
    });
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
        error: 'Booking not found',
        code: 'BOOKING_NOT_FOUND'
      });
    }

    // Check if field is assigned to this operator
    const assignedFields = await getFieldsByOperator(operatorId);
    const isAssigned = assignedFields.some(field => field.id === booking.field_id);

    if (!isAssigned) {
      return res.status(403).json({
        error: 'Access denied. Field not assigned to this operator',
        code: 'FIELD_NOT_ASSIGNED'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        error: 'Booking cannot be confirmed',
        code: 'BOOKING_NOT_CONFIRMABLE'
      });
    }

    // BUSINESS RULE: Payment must be completed before booking can be confirmed
    if (booking.payment_status !== 'paid') {
      return res.status(400).json({
        error: 'Booking cannot be confirmed. Payment must be completed first',
        code: 'PAYMENT_NOT_COMPLETED',
        details: {
          current_payment_status: booking.payment_status,
          required_payment_status: 'paid',
          message: 'Please ensure payment is processed by kasir before confirming booking'
        }
      });
    }

    // Confirm booking
    const updatedBooking = await updateBookingStatus(
      id,
      'confirmed',
      operatorId,
      notes || `Confirmed by operator: ${req.rawUser.name}`
    );

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      error: 'Failed to confirm booking',
      code: 'BOOKING_CONFIRM_FAILED'
    });
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
        error: 'Booking not found',
        code: 'BOOKING_NOT_FOUND'
      });
    }

    // Check if field is assigned to this operator
    const assignedFields = await getFieldsByOperator(operatorId);
    const isAssigned = assignedFields.some(field => field.id === booking.field_id);

    if (!isAssigned) {
      return res.status(403).json({
        error: 'Access denied. Field not assigned to this operator',
        code: 'FIELD_NOT_ASSIGNED'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        error: 'Booking cannot be completed',
        code: 'BOOKING_NOT_COMPLETABLE'
      });
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
      success: true,
      message: 'Booking completed successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      error: 'Failed to complete booking',
      code: 'BOOKING_COMPLETE_FAILED'
    });
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
      field: field,
      bookings: operatorTodayBookings.filter(booking => booking.field_id === field.id)
    }));

    res.json({
      success: true,
      data: {
        date: new Date().toISOString().split('T')[0],
        schedule_by_field: scheduleByField,
        total_bookings: operatorTodayBookings.length
      }
    });

  } catch (error) {
    console.error('Get today schedule error:', error);
    res.status(500).json({
      error: 'Failed to get today schedule'
    });
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

    res.json({
      success: true,
      data: {
        bookings: paginatedBookings,
        assigned_fields: assignedFields,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: bookings.length,
          total_pages: Math.ceil(bookings.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all bookings operator error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bookings',
      code: 'OPERATOR_BOOKINGS_FETCH_FAILED'
    });
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
        success: false,
        error: 'Booking not found',
        code: 'BOOKING_NOT_FOUND'
      });
    }

    // Check if operator has access to this field
    const assignedFields = await getFieldsByOperator(operatorId);
    const hasAccess = assignedFields.some(f => f.id === booking.field_id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this field',
        code: 'FIELD_ACCESS_DENIED'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking detail operator error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get booking detail',
      code: 'OPERATOR_BOOKING_DETAIL_FAILED'
    });
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
