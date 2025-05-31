const {
  getAllFields,
  getFieldById,
  updateField,
  getFieldsByOperator,
  updateFieldRating
} = require('../../../models/fieldModel');
const {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  getBookingsByStatus,
  getTodayBookings,
  getUpcomingBookings,
  getBookingsByField
} = require('../../../models/bookingModel');

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
    
    res.json({
      success: true,
      data: {
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
      }
    });

  } catch (error) {
    console.error('Get operator dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get operator dashboard'
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

module.exports = {
  getOperatorDashboard,
  getAssignedFields,
  updateFieldStatus,
  getFieldBookings,
  confirmBooking,
  completeBooking,
  getTodaySchedule
};
