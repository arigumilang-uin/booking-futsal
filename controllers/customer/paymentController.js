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

    console.log('🔍 CUSTOMER PAYMENTS REQUEST:', {
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
      total_amount: allPaymentData
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    };

    console.log('✅ CUSTOMER PAYMENTS SUCCESS:', {
      totalPayments: allPaymentData.length,
      actualPayments: filteredPayments.length,
      pendingBookings: pendingPaymentObjects.length,
      stats
    });

    res.json({
      success: true,
      data: allPaymentData,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: allPaymentData.length
      }
    });

  } catch (error) {
    console.error('❌ Get customer payments error:', error);
    res.status(500).json({
      error: 'Failed to get customer payments',
      details: error.message
    });
  }
};

// Get customer payment detail
const getCustomerPaymentDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log('🔍 CUSTOMER PAYMENT DETAIL REQUEST:', {
      userId,
      paymentId: id
    });

    // Handle booking payment format
    if (id.startsWith('booking_')) {
      const bookingId = id.replace('booking_', '');
      const booking = await getBookingById(bookingId);
      
      if (!booking || booking.user_id !== userId) {
        return res.status(404).json({
          error: 'Booking not found or access denied'
        });
      }

      // Return booking as payment-like object
      const paymentLikeObject = {
        id: `booking_${booking.id}`,
        booking_id: booking.id,
        booking_number: booking.booking_number,
        amount: booking.total_amount,
        method: 'pending',
        status: 'pending',
        user_name: booking.customer_name || req.user.name,
        field_name: booking.field_name,
        created_at: booking.created_at,
        is_booking_payment: true,
        booking_details: booking
      };

      return res.json({
        success: true,
        data: paymentLikeObject
      });
    }

    // Handle regular payment
    const payment = await getPaymentById(id);
    if (!payment) {
      return res.status(404).json({
        error: 'Payment not found'
      });
    }

    // Verify payment belongs to user
    const booking = await getBookingById(payment.booking_id);
    if (!booking || booking.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    console.log('✅ CUSTOMER PAYMENT DETAIL SUCCESS:', {
      paymentId: payment.id,
      bookingId: payment.booking_id,
      amount: payment.amount,
      status: payment.status
    });

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('❌ Get customer payment detail error:', error);
    res.status(500).json({
      error: 'Failed to get payment detail',
      details: error.message
    });
  }
};

// Create payment for booking
const createCustomerPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;
    const { method, amount, currency = 'IDR' } = req.body;

    console.log('🔍 CREATE CUSTOMER PAYMENT REQUEST:', {
      userId,
      bookingId,
      method,
      amount,
      currency
    });

    // Validate booking
    const booking = await getBookingById(bookingId);
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

    if (booking.payment_status === 'paid') {
      return res.status(400).json({
        error: 'Booking already paid'
      });
    }

    // Check if payment already exists
    const existingPayments = await getPaymentsByBookingId(bookingId);
    if (existingPayments.length > 0) {
      return res.status(400).json({
        error: 'Payment already exists for this booking'
      });
    }

    // Create payment
    const paymentData = {
      booking_id: bookingId,
      amount: amount || booking.total_amount,
      method: method,
      status: 'pending',
      currency: currency
    };

    const newPayment = await createPayment(paymentData);

    console.log('✅ CUSTOMER PAYMENT CREATED:', {
      paymentId: newPayment.id,
      bookingId,
      amount: paymentData.amount,
      method: paymentData.method
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: newPayment
    });

  } catch (error) {
    console.error('❌ Create customer payment error:', error);
    res.status(500).json({
      error: 'Failed to create payment',
      details: error.message
    });
  }
};

// Upload payment proof
const uploadPaymentProof = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    console.log('🔍 UPLOAD PAYMENT PROOF REQUEST:', {
      userId,
      paymentId: id,
      hasFile: !!req.file
    });

    // Get payment and verify ownership
    const payment = await getPaymentById(id);
    if (!payment) {
      return res.status(404).json({
        error: 'Payment not found'
      });
    }

    const booking = await getBookingById(payment.booking_id);
    if (!booking || booking.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // For now, just update payment status to indicate proof uploaded
    // In production, you would save the file and update payment record
    const updatedPayment = await updatePaymentStatus(id, 'pending', {
      proof_uploaded: true,
      proof_filename: req.file.filename,
      uploaded_at: new Date().toISOString()
    });

    console.log('✅ PAYMENT PROOF UPLOADED:', {
      paymentId: id,
      filename: req.file.filename,
      size: req.file.size
    });

    res.json({
      success: true,
      message: 'Payment proof uploaded successfully',
      data: updatedPayment
    });

  } catch (error) {
    console.error('❌ Upload payment proof error:', error);
    res.status(500).json({
      error: 'Failed to upload payment proof',
      details: error.message
    });
  }
};

module.exports = {
  getCustomerPayments,
  getCustomerPaymentDetail,
  createCustomerPayment,
  uploadPaymentProof
};
