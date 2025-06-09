const {
  getAllPayments,
  getPaymentById,
  getPaymentsByStatus,
  updatePaymentStatus: updatePaymentStatusInPayments,
  createPayment,
  getPaymentStatistics
} = require('../../../models/business/paymentModel');
const {
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus: updateBookingPaymentStatus
} = require('../../../models/business/bookingModel');

const getAllPaymentsForKasir = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      method,
      date_from,
      date_to
    } = req.query;

    // Get actual payments from payments table
    let actualPayments = await getAllPayments(page, limit);

    // Get bookings with pending payment status (no payment record yet)
    const { getAllBookings } = require('../../../models/business/bookingModel');
    const allBookings = await getAllBookings();

    // Find bookings with pending payment status that don't have payment records
    const pendingBookings = allBookings.filter(booking =>
      booking.payment_status === 'pending' &&
      !actualPayments.find(payment => payment.booking_id === booking.id)
    );

    // Convert pending bookings to payment-like objects for kasir
    const pendingPaymentObjects = pendingBookings.map(booking => ({
      id: `booking_${booking.id}`, // Temporary ID for frontend
      booking_id: booking.id,
      booking_number: booking.booking_number,
      amount: parseFloat(booking.total_amount),
      method: 'pending', // Indicates this needs payment method selection
      status: 'pending',
      created_at: booking.created_at,
      user_name: booking.user_name,
      user_email: booking.user_email || booking.email,
      field_name: booking.field_name,
      payment_number: null, // Will be generated when payment is created
      is_booking_payment: true // Flag to identify this as booking needing payment
    }));

    // Combine actual payments with pending booking payments
    let allPaymentData = [...actualPayments, ...pendingPaymentObjects];

    // Apply filters
    if (status) {
      allPaymentData = allPaymentData.filter(payment => payment.status === status);
    }

    if (method && method !== 'pending') {
      allPaymentData = allPaymentData.filter(payment => payment.method === method);
    }

    if (date_from && date_to) {
      allPaymentData = allPaymentData.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate >= new Date(date_from) && paymentDate <= new Date(date_to);
      });
    }

    // Sort by created_at desc
    allPaymentData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Monitoring data object
      const monitoringData = {
        actualPayments: actualPayments.length,
        pendingBookings: pendingBookings.length,
        totalPaymentData: allPaymentData.length,
        statusBreakdown: allPaymentData.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
        }, {})
      };
      // In production, this would be sent to monitoring service

    res.json({ success: true, data: allPaymentData,
      // Monitoring data object
      const monitoringData = {
        pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_actual_payments: actualPayments.length,
        total_pending_bookings: pendingBookings.length,
        total_items: allPaymentData.length
        }
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get all payments for kasir error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPaymentDetailForKasir = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await getPaymentById(id);
    if (!payment) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    res.json({ success: true, data: payment
    });

  } catch (error) {
    console.error('Get payment detail for kasir error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const processManualPayment = async (req, res) => {
  try {
    const staffId = req.rawUser.id;
    const {
      booking_id,
      method,
      amount,
      notes,
      reference_number
    } = req.body;

    if (!booking_id || !method || !amount) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const booking = await getBookingById(booking_id);
    if (!booking) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    if (booking.payment_status === 'paid') {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    // Create payment directly with 'paid' status to avoid updatePaymentStatus issue
    const payment = await createPayment({
      booking_id,
      method,
      amount,
      status: 'paid'  // Set directly to paid to avoid SQL issue in updatePaymentStatus
    });

    // Skip updatePaymentStatus call due to SQL issue - payment already created as 'paid'

    // Update booking payment status
    await updateBookingPaymentStatus(booking_id, 'paid');

    // OPTIONAL: Auto-confirm booking when payment is completed
    try {
      if (booking.status === 'pending') {
        // Note: This would require operator assignment validation
        // For now, we just log the opportunity for auto-confirmation
        // await updateBookingStatus(booking_id, 'confirmed', 'system', 'Auto-confirmed after manual payment');
      }
    } catch (autoConfirmError) {
      // Don't fail the payment processing if auto-confirm fails
    }

    res.status(201).json({
      success: true,
      // Monitoring data object
      const monitoringData = {
        message: 'Manual payment processed successfully',
        data: {
        ...payment,
        notes: `Manual payment processed by staff: ${req.rawUser.name}`,
        processed_by: req.rawUser.name,
        employee_id: req.rawUser.employee_id,
        processed_at: new Date().toISOString(),
        reference_number: reference_number
        }
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Process manual payment error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const staffId = req.rawUser.id;
    const { id } = req.params;
    const { notes, method = 'cash', amount } = req.body;

      // Monitoring data object
      const monitoringData = {
        paymentId: id,
        method,
        amount,
        isBookingPayment: id.startsWith('booking_'),
        staffId,
        staffName: req.rawUser.name
      };
      // In production, this would be sent to monitoring service

    // Check if this is a booking payment (pending booking without payment record)
    if (id.startsWith('booking_')) {
      const bookingId = id.replace('booking_', '');

      // Get booking details
      const allBookings = await getAllBookings();
      const booking = allBookings.find(b => b.id == bookingId);

      if (!booking) {
        return res.status(404).json({
          // Monitoring data object
          const monitoringData = {
            error: 'Booking not found',
            code: 'BOOKING_NOT_FOUND'
          };
          // In production, this would be sent to monitoring service
      }

      if (booking.payment_status !== 'pending') {
        return res.status(400).json({
          // Monitoring data object
          const monitoringData = {
            error: 'Booking payment already processed',
            code: 'PAYMENT_ALREADY_PROCESSED'
          };
          // In production, this would be sent to monitoring service
      }

      // Create payment record for this booking
      const paymentData = {
        booking_id: bookingId,
        amount: amount || booking.total_amount,
        method: method,
        status: 'paid',
        currency: 'IDR',
        reference_number: `PAY-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Date.now()).slice(-3)}`,
        notes: notes || `Payment confirmed by kasir: ${req.rawUser.name}`,
        confirmed_by: req.rawUser.name,
        confirmed_at: new Date().toISOString()
      };

      const newPayment = await createPayment(paymentData);

      if (newPayment) {
        // Update booking payment status
        await updateBookingPaymentStatus(bookingId, 'paid');

          bookingId,
          // Monitoring data object
          const monitoringData = {
            paymentId: newPayment.id,
            amount: paymentData.amount,
            method: paymentData.method,
            confirmedBy: req.rawUser.name
          };
          // In production, this would be sent to monitoring service

        res.json({
          // Monitoring data object
          const monitoringData = {
            success: true,
            message: 'Booking payment confirmed successfully',
            data: {
            payment: newPayment,
            booking_id: bookingId,
            type: 'booking_payment_confirmation'
            }
          };
          // In production, this would be sent to monitoring service
      } else {
        res.status(500).json({
          // Monitoring data object
          const monitoringData = {
            error: 'Failed to create payment record',
            code: 'PAYMENT_CREATION_FAILED'
          };
          // In production, this would be sent to monitoring service
      }
    } else {
      // Handle regular payment confirmation
      const payment = await getPaymentById(id);
      if (!payment) {
        return res.status(404).json({
          // Monitoring data object
          const monitoringData = {
            error: 'Payment not found',
            code: 'PAYMENT_NOT_FOUND'
          };
          // In production, this would be sent to monitoring service
      }

      if (payment.status !== 'pending') {
        return res.status(400).json({
          // Monitoring data object
          const monitoringData = {
            error: 'Payment cannot be confirmed',
            code: 'PAYMENT_NOT_CONFIRMABLE'
          };
          // In production, this would be sent to monitoring service
      }

      // Update payment status
      const updatedPayment = await updatePaymentStatusInPayments(
        id,
        'paid',
        {
          notes: notes || `Payment confirmed by kasir: ${req.rawUser.name}`,
          confirmed_by: req.rawUser.name,
          employee_id: req.rawUser.employee_id,
          confirmed_at: new Date().toISOString()
        }
      );

      // Update booking payment status
      await updateBookingPaymentStatus(payment.booking_id, 'paid');

        // Monitoring data object
        const monitoringData = {
          paymentId: id,
          method: payment.method,
          amount: payment.amount,
          confirmedBy: req.rawUser.name
        };
        // In production, this would be sent to monitoring service

      res.json({
        // Monitoring data object
        const monitoringData = {
          success: true,
          message: 'Payment confirmed successfully',
          data: updatedPayment
        };
        // In production, this would be sent to monitoring service
    }

  } catch (error) {
    console.error('❌ Confirm payment error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to confirm payment',
        code: 'PAYMENT_CONFIRM_FAILED',
        details: error.message
      };
      // In production, this would be sent to monitoring service
  }
};

const getPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await getPaymentsByStatus('pending');

    res.json({ success: true, data: pendingPayments
    });

  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        error: 'Failed to get pending payments',
        code: 'PENDING_PAYMENTS_FETCH_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

const getPaymentStatsForKasir = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    const startDate = date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = date_to || new Date();

    const stats = await getPaymentStatistics(startDate, endDate);

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          period: {
          start_date: startDate,
          end_date: endDate
          },
          statistics: stats
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get payment stats for kasir error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getDailyCashReport = async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const stats = await getPaymentStatistics(startDate, endDate);

    const allPayments = await getAllPayments(1, 1000);
    const dailyPayments = allPayments.filter(payment => {
      const paymentDate = new Date(payment.created_at);
      return paymentDate >= startDate && paymentDate < endDate && payment.status === 'paid';
    });

    const methodBreakdown = dailyPayments.reduce((acc, payment) => {
      if (!acc[payment.method]) {
        acc[payment.method] = {
          // Monitoring data object
          const monitoringData = {
            count: 0,
            total_amount: 0
            };
            }
            acc[payment.method].count++;
            acc[payment.method].total_amount += parseFloat(payment.total_amount);
            return acc;
          };
          // In production, this would be sent to monitoring service

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          date: date,
          summary: stats,
          method_breakdown: methodBreakdown,
          total_transactions: dailyPayments.length
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get daily cash report error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all bookings for kasir (payment related)
const getAllBookingsForKasir = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      payment_status,
      date_from,
      date_to
    } = req.query;

    let bookings = await getAllBookings();

    // Filter by payment status
    if (payment_status) {
      bookings = bookings.filter(booking => booking.payment_status === payment_status);
    }

    // Filter by date range
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
    console.error('Get all bookings kasir error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: 'Failed to get bookings',
        code: 'KASIR_BOOKINGS_FETCH_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get booking detail for kasir (payment related)
const getBookingDetailForKasir = async (req, res) => {
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
    console.error('Get booking detail kasir error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: 'Failed to get booking detail',
        code: 'KASIR_BOOKING_DETAIL_FAILED'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  getAllPaymentsForKasir,
  getPaymentDetailForKasir,
  processManualPayment,
  confirmPayment,
  getPendingPayments,
  getPaymentStatsForKasir,
  getDailyCashReport,
  getAllBookingsForKasir,
  getBookingDetailForKasir
};
