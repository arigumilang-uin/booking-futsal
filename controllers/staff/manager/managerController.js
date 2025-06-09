const {
  getAllFields,
  createField,
  updateField,
  deleteField
} = require('../../../models/business/fieldModel');
const {
  getAllBookings,
  getBookingById,
  updateBookingStatus
} = require('../../../models/business/bookingModel');
const {
  getDashboardOverview
} = require('../../shared/analyticsController');

const getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.rawUser.id;
    const dashboardData = await getDashboardOverview('manajer_futsal', managerId);

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          manager_info: {
          name: req.rawUser.name,
          employee_id: req.rawUser.employee_id,
          department: req.rawUser.department,
          role: 'Manajer Futsal'
          },
          ...dashboardData
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get manager dashboard error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil dashboard manajer'
      };
      // In production, this would be sent to monitoring service
  }
};

// User management functions moved to admin/roleManagementController
// Manager should use role management endpoints for user operations

const getAllFieldsForManager = async (req, res) => {
  try {
    const fields = await getAllFields();

    res.json({ success: true, data: fields
    });

  } catch (error) {
    console.error('Get all fields for manager error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get fields',
        code: 'FIELDS_FETCH_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

const createFieldByManager = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { name, type, description, hourly_rate, facilities, coordinates } = req.body;

    // Validate required fields
    if (!name || !hourly_rate) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Name and hourly_rate are required'
        };
        // In production, this would be sent to monitoring service
    }

    const fieldData = {
      name,
      type: type || 'futsal',
      description: description || '',
      price: hourly_rate,
      facilities: facilities || [],
      coordinates: coordinates || null,
      // Monitoring data object
      const monitoringData = {
        created_by: managerId
        };
        const newField = await createField(fieldData);
        res.status(201).json({
        success: true,
        message: 'Field created successfully',
        data: newField
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Create field by manager error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to create field',
        code: 'FIELD_CREATE_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

const updateFieldByManager = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { id } = req.params;
    const updateData = {
      ...req.body,
      // Monitoring data object
      const monitoringData = {
        updated_by: managerId
        };
        const updatedField = await updateField(id, updateData);
        if (!updatedField) {
        return res.status(404).json({
        error: 'Field not found',
        code: 'FIELD_NOT_FOUND'
      };
      // In production, this would be sent to monitoring service
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Field updated successfully',
        data: updatedField
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Update field by manager error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to update field',
        code: 'FIELD_UPDATE_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

// Placeholder functions for missing imports
const getAllUsersForManager = async (req, res) => {
  try {
    // This would be implemented with proper user management
    res.json({ success: true, data: [],
      // Monitoring data object
      const monitoringData = {
        message: 'User management moved to role management endpoints'
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get all users for manager error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get users',
        code: 'USERS_FETCH_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

const updateUserRoleByManager = async (req, res) => {
  try {
    // This would be implemented with proper role management
    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'User role management moved to role management endpoints'
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Update user role by manager error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to update user role',
        code: 'USER_ROLE_UPDATE_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

const updateUserStatusByManager = async (req, res) => {
  try {
    // This would be implemented with proper user status management
    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'User status management moved to role management endpoints'
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Update user status by manager error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to update user status',
        code: 'USER_STATUS_UPDATE_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

const getBusinessAnalytics = async (req, res) => {
  try {
    // This would be implemented with proper analytics
    res.json({ success: true, data: {
        period: {
          start_date: req.query.date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end_date: req.query.date_to || new Date()
        },
        // Monitoring data object
        const monitoringData = {
          analytics: {
          total_bookings: 0,
          total_revenue: 0,
          field_utilization: 0,
          customer_satisfaction: 0
          }
          },
          message: 'Analytics implementation in progress'
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get business analytics error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get business analytics',
        code: 'ANALYTICS_FETCH_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get all bookings for manager
const getAllBookingsForManager = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      field_id,
      date_from,
      date_to
    } = req.query;

    let bookings = await getAllBookings();

    // Apply filters
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
    console.error('Get all bookings manager error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: 'Failed to get bookings',
        code: 'MANAGER_BOOKINGS_FETCH_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get booking detail for manager
const getBookingDetailForManager = async (req, res) => {
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
    console.error('Get booking detail manager error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: 'Failed to get booking detail',
        code: 'MANAGER_BOOKING_DETAIL_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

// Update booking status for manager
const updateBookingStatusForManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const managerId = req.rawUser.id;

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
    if (status === 'confirmed' && booking.payment_status !== 'paid') {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
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

    const updatedBooking = await updateBookingStatus(
      id,
      status,
      managerId,
      reason || `Status updated by manager: ${req.rawUser.name}`
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
    console.error('Update booking status manager error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: 'Failed to update booking status',
        code: 'MANAGER_BOOKING_UPDATE_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  getManagerDashboard,
  getAllUsersForManager,
  updateUserRoleByManager,
  updateUserStatusByManager,
  getAllFieldsForManager,
  createFieldByManager,
  updateFieldByManager,
  getBusinessAnalytics,
  getAllBookingsForManager,
  getBookingDetailForManager,
  updateBookingStatusForManager
};
