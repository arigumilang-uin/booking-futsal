const {
  getUserById,
  updateUserProfile
} = require('../../models/core/userModel');
const {
  getAvailableFields,
  getFieldById
} = require('../../models/business/fieldModel');
const {
  createBooking,
  getBookingsByUserId,
  getBookingById,
  updateBookingStatus,
  checkBookingConflict
} = require('../../models/business/bookingModel');
const {
  createPayment,
  getPaymentsByBookingId
} = require('../../models/business/paymentModel');

const getCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const { password: _, ...userProfile } = user;

    res.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile'
    });
  }
};

const updateCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    const updatedUser = await updateUserProfile(userId, { name, email, phone });
    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
};

const getCustomerFields = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, location } = req.query;

    let fields = await getAvailableFields();

    if (search) {
      fields = fields.filter(field =>
        field.name.toLowerCase().includes(search.toLowerCase()) ||
        field.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      fields = fields.filter(field => field.type === type);
    }

    if (location) {
      fields = fields.filter(field =>
        field.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFields = fields.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedFields,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: fields.length,
        total_pages: Math.ceil(fields.length / limit)
      }
    });

  } catch (error) {
    console.error('Get customer fields error:', error);
    res.status(500).json({
      error: 'Failed to get fields'
    });
  }
};

const createCustomerBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      field_id, date, start_time, end_time,
      name, phone, email, notes
    } = req.body;

    if (!field_id || !date || !start_time || !end_time || !name || !phone) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const field = await getFieldById(field_id);
    if (!field || field.status !== 'active') {
      return res.status(404).json({
        error: 'Field not found or not available'
      });
    }

    const conflict = await checkBookingConflict({
      field_id, date, start_time, end_time
    });

    if (conflict.hasConflict) {
      return res.status(400).json({
        error: 'Time slot conflict detected',
        conflicts: conflict.conflicts
      });
    }

    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
    const base_amount = isWeekend && field.price_weekend ? field.price_weekend : field.price;
    const admin_fee = 5000;

    const booking = await createBooking({
      user_id: userId,
      field_id,
      date,
      start_time,
      end_time,
      name,
      phone,
      email: email || req.user.email,
      notes,
      base_amount,
      admin_fee,
      created_by: userId
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.error('Create customer booking error:', error);
    res.status(500).json({
      error: 'Failed to create booking'
    });
  }
};

const getCustomerBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    let bookings = await getBookingsByUserId(userId);

    if (status) {
      bookings = bookings.filter(booking => booking.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedBookings,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: bookings.length,
        total_pages: Math.ceil(bookings.length / limit)
      }
    });

  } catch (error) {
    console.error('Get customer bookings error:', error);
    res.status(500).json({
      error: 'Failed to get bookings'
    });
  }
};

const getCustomerBookingDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    if (booking.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const payments = await getPaymentsByBookingId(id);

    res.json({
      success: true,
      data: {
        ...booking,
        payments
      }
    });

  } catch (error) {
    console.error('Get customer booking detail error:', error);
    res.status(500).json({
      error: 'Failed to get booking detail'
    });
  }
};

const cancelCustomerBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    if (booking.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        error: 'Booking cannot be cancelled'
      });
    }

    // Cek batas waktu pembatalan (2 jam sebelum booking)
    const bookingDateTime = new Date(`${booking.date} ${booking.start_time}`);
    const now = new Date();
    const timeDiff = bookingDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 2) {
      return res.status(400).json({
        error: 'Cannot cancel booking less than 2 hours before start time'
      });
    }

    const updatedBooking = await updateBookingStatus(
      id,
      'cancelled',
      userId,
      reason || 'Cancelled by customer'
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Cancel customer booking error:', error);
    res.status(500).json({
      error: 'Failed to cancel booking'
    });
  }
};

module.exports = {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerFields,
  createCustomerBooking,
  getCustomerBookings,
  getCustomerBookingDetail,
  cancelCustomerBooking
};
