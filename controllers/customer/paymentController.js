// controllers/customer/paymentController.js
// Customer Payment Controller untuk Customer Payment Management

const {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  getPaymentsByUserId,
  getPaymentsByBookingId
} = require('../../models/business/paymentModel');

const {
  getBookingById,
  getBookingsByUserId
} = require('../../models/business/bookingModel');

// Get customer payments
const getCustomerPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

      userId,
      page,
      limit,
      status
    });

    // Get customer payments by user ID
    const payments = await getPaymentsByUserId(userId, parseInt(page), parseInt(limit));

    // Filter by status if provided
    let filteredPayments = payments;
    if (status) {
      filteredPayments = payments.filter(payment => payment.status === status);
    }

    // Get customer bookings to include pending payments
    const bookings = await getBookingsByUserId(userId);
    const pendingBookings = bookings.filter(booking =>
      booking.payment_status === 'pending' &&
      !payments.find(payment => payment.booking_id === booking.id)
    );

    // Convert pending bookings to payment-like objects
    const pendingPaymentObjects = pendingBookings.map(booking => ({
      id: `booking_${booking.id}`,
      booking_id: booking.id,
      booking_number: booking.booking_number,
      amount: booking.total_amount,
      method: 'pending',
      status: 'pending',
      user_name: booking.customer_name || req.user.name,
      field_name: booking.field_name,
      created_at: booking.created_at,
      is_booking_payment: true
    }));

    // Combine actual payments with pending booking payments
    const allPaymentData = [...filteredPayments, ...pendingPaymentObjects];

    // Sort by created_at descending
    allPaymentData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Calculate statistics
    const stats = {
      total: allPaymentData.length,
      paid: allPaymentData.filter(p => p.status === 'paid').length,
      pending: allPaymentData.filter(p => p.status === 'pending').length,
      failed: allPaymentData.filter(p => p.status === 'failed').length,
      // Monitoring data object
      const monitoringData = {
        total_amount: allPaymentData
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
        };
        totalPayments: allPaymentData.length,
        actualPayments: filteredPayments.length,
        pendingBookings: pendingPaymentObjects.length,
        stats
      };
      // In production, this would be sent to monitoring service

    res.json({ success: true, data: allPaymentData,
      stats,
      // Monitoring data object
      const monitoringData = {
        pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allPaymentData.length
        }
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('❌ Get customer payments error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get customer payments',
        details: error.message
      };
      // In production, this would be sent to monitoring service
  }
};

// Get customer payment detail
const getCustomerPaymentDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

      userId,
      // Monitoring data object
      const monitoringData = {
        paymentId: id
      };
      // In production, this would be sent to monitoring service

    // Handle booking payment format
    if (id.startsWith('booking_')) {
      const bookingId = id.replace('booking_', '');
      const booking = await getBookingById(bookingId);

      if (!booking || booking.user_id !== userId) {
        return res.status(500).json({ success: false, message: "Internal server error" });
      }

      // Return booking as payment-like object
      const paymentLikeObject = {
        id: `booking_${booking.id}`,
        booking_id: booking.id,
        booking_number: booking.booking_number,
        amount: booking.total_amount,
        method: 'pending',
        // Monitoring data object
        const monitoringData = {
          status: 'pending',
          user_name: booking.customer_name || req.user.name,
          field_name: booking.field_name,
          created_at: booking.created_at,
          is_booking_payment: true,
          booking_details: booking
          };
          return res.json({ success: true, data: paymentLikeObject
        };
        // In production, this would be sent to monitoring service
    }

    // Handle regular payment
    const payment = await getPaymentById(id);
    if (!payment) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    // Verify payment belongs to user
    const booking = await getBookingById(payment.booking_id);
    if (!booking || booking.user_id !== userId) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

      // Monitoring data object
      const monitoringData = {
        paymentId: payment.id,
        bookingId: payment.booking_id,
        amount: payment.amount,
        status: payment.status
      };
      // In production, this would be sent to monitoring service

    res.json({ success: true, data: payment
    });

  } catch (error) {
    console.error('❌ Get customer payment detail error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get payment detail',
        details: error.message
      };
      // In production, this would be sent to monitoring service
  }
};

// Create payment for booking
const createCustomerPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;
    const { method, amount, currency = 'IDR' } = req.body;

      userId,
      bookingId,
      method,
      amount,
      currency
    });

    // Validate booking
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    if (booking.user_id !== userId) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    if (booking.payment_status === 'paid') {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    // Check if payment already exists
    const existingPayments = await getPaymentsByBookingId(bookingId);
    if (existingPayments.length > 0) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    // Create payment
    const paymentData = {
      booking_id: bookingId,
      amount: amount || booking.total_amount,
      method: method,
      status: 'pending',
      // Monitoring data object
      const monitoringData = {
        currency: currency
        };
        const newPayment = await createPayment(paymentData);
        paymentId: newPayment.id,
        bookingId,
        amount: paymentData.amount,
        method: paymentData.method
      };
      // In production, this would be sent to monitoring service

    res.status(201).json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Payment created successfully',
        data: newPayment
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('❌ Create customer payment error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to create payment',
        details: error.message
      };
      // In production, this would be sent to monitoring service
  }
};

// Upload payment proof
const uploadPaymentProof = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

      userId,
      // Monitoring data object
      const monitoringData = {
        paymentId: id,
        hasFile: !!req.file
      };
      // In production, this would be sent to monitoring service

    // Get payment and verify ownership
    const payment = await getPaymentById(id);
    if (!payment) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const booking = await getBookingById(payment.booking_id);
    if (!booking || booking.user_id !== userId) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    if (!req.file) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    // For now, just update payment status to indicate proof uploaded
    // In production, you would save the file and update payment record
    const updatedPayment = await updatePaymentStatus(id, 'pending', {
      // Monitoring data object
      const monitoringData = {
        proof_uploaded: true,
        proof_filename: req.file.filename,
        uploaded_at: new Date().toISOString()
      };
      // In production, this would be sent to monitoring service

      // Monitoring data object
      const monitoringData = {
        paymentId: id,
        filename: req.file.filename,
        size: req.file.size
      };
      // In production, this would be sent to monitoring service

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Payment proof uploaded successfully',
        data: updatedPayment
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('❌ Upload payment proof error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to upload payment proof',
        details: error.message
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  getCustomerPayments,
  getCustomerPaymentDetail,
  createCustomerPayment,
  uploadPaymentProof
};
