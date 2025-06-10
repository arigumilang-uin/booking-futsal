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

    console.log('🔍 KASIR PAYMENT DATA SUMMARY:', {
      actualPayments: actualPayments.length,
      pendingBookings: pendingBookings.length,
      totalPaymentData: allPaymentData.length,
      statusBreakdown: allPaymentData.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {})
    });

    res.json({
      success: true,
      data: allPaymentData,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total_actual_payments: actualPayments.length,
        total_pending_bookings: pendingBookings.length,
        total_items: allPaymentData.length
      }
    });

  } catch (error) {
    console.error('Get all payments for kasir error:', error);
    res.status(500).json({
      error: 'Failed to get payments'
    });
  }
};

const getPaymentDetailForKasir = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await getPaymentById(id);
    if (!payment) {
      return res.status(404).json({
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment detail for kasir error:', error);
    res.status(500).json({
      error: 'Failed to get payment detail'
    });
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
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const booking = await getBookingById(booking_id);
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    if (booking.payment_status === 'paid') {
      return res.status(400).json({
        error: 'Booking already paid'
      });
    }

    // Create payment directly with 'paid' status to avoid updatePaymentStatus issue
    const payment = await createPayment({
      booking_id,
      method,
      amount,
      status: 'paid'  // Set directly to paid to avoid SQL issue in updatePaymentStatus
    });

    // Skip updatePaymentStatus call due to SQL issue - payment already created as 'paid'
    // const updatedPayment = await updatePaymentStatus(payment.id, 'paid', gatewayResponse);

    // Update booking payment status
    await updateBookingPaymentStatus(booking_id, 'paid');

    // OPTIONAL: Auto-confirm booking when payment is completed
    try {
      if (booking.status === 'pending') {
        console.log(`[AUTO-CONFIRM] Manual payment processed for booking ${booking.booking_number}, auto-confirmation opportunity available`);
        // Note: This would require operator assignment validation
        // For now, we just log the opportunity for auto-confirmation
        // await updateBookingStatus(booking_id, 'confirmed', 'system', 'Auto-confirmed after manual payment');
      }
    } catch (autoConfirmError) {
      console.log('[AUTO-CONFIRM] Error during auto-confirmation attempt:', autoConfirmError.message);
      // Don't fail the payment processing if auto-confirm fails
    }

    res.status(201).json({
      success: true,
      message: 'Manual payment processed successfully',
      data: {
        ...payment,
        notes: `Manual payment processed by staff: ${req.rawUser.name}`,
        processed_by: req.rawUser.name,
        employee_id: req.rawUser.employee_id,
        processed_at: new Date().toISOString(),
        reference_number: reference_number
      }
    });

  } catch (error) {
    console.error('Process manual payment error:', error);
    res.status(500).json({
      error: 'Failed to process manual payment'
    });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const staffId = req.rawUser.id;
    const { id } = req.params;
    const { notes, method = 'cash', amount } = req.body;

    console.log('🔍 KASIR CONFIRM PAYMENT:', {
      paymentId: id,
      method,
      amount,
      isBookingPayment: id.startsWith('booking_'),
      staffId,
      staffName: req.rawUser.name
    });

    // Check if this is a booking payment (pending booking without payment record)
    if (id.startsWith('booking_')) {
      const bookingId = id.replace('booking_', '');

      // Get booking details
      const allBookings = await getAllBookings();
      const booking = allBookings.find(b => b.id == bookingId);

      if (!booking) {
        return res.status(404).json({
          error: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        });
      }

      if (booking.payment_status !== 'pending') {
        return res.status(400).json({
          error: 'Booking payment already processed',
          code: 'PAYMENT_ALREADY_PROCESSED'
        });
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

        console.log('✅ BOOKING PAYMENT CONFIRMED:', {
          bookingId,
          paymentId: newPayment.id,
          amount: paymentData.amount,
          method: paymentData.method,
          confirmedBy: req.rawUser.name
        });

        res.json({
          success: true,
          message: 'Booking payment confirmed successfully',
          data: {
            payment: newPayment,
            booking_id: bookingId,
            type: 'booking_payment_confirmation'
          }
        });
      } else {
        res.status(500).json({
          error: 'Failed to create payment record',
          code: 'PAYMENT_CREATION_FAILED'
        });
      }
    } else {
      // Handle regular payment confirmation
      const payment = await getPaymentById(id);
      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found',
          code: 'PAYMENT_NOT_FOUND'
        });
      }

      if (payment.status !== 'pending') {
        return res.status(400).json({
          error: 'Payment cannot be confirmed',
          code: 'PAYMENT_NOT_CONFIRMABLE'
        });
      }

      // Use direct SQL update to bypass updatePaymentStatus issues
      const pool = require('../../../config/db');
      const updateQuery = `
        UPDATE payments
        SET status = 'paid',
            paid_at = NOW(),
            updated_at = NOW(),
            gateway_response = $1
        WHERE id = $2
        RETURNING id, uuid, payment_number, status, paid_at, updated_at
      `;

      const confirmationNotes = notes || `Payment confirmed by kasir: ${req.rawUser.name}`;
      const updateResult = await pool.query(updateQuery, [confirmationNotes, id]);
      const updatedPayment = updateResult.rows[0];

      if (!updatedPayment) {
        return res.status(500).json({
          error: 'Failed to update payment status',
          code: 'PAYMENT_UPDATE_FAILED'
        });
      }

      // Update booking payment status
      await updateBookingPaymentStatus(payment.booking_id, 'paid');

      console.log('✅ REGULAR PAYMENT CONFIRMED:', {
        paymentId: id,
        method: payment.method,
        amount: payment.amount,
        confirmedBy: req.rawUser.name
      });

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          ...updatedPayment,
          booking_id: payment.booking_id,
          method: payment.method,
          amount: payment.amount
        }
      });
    }

  } catch (error) {
    console.error('❌ Confirm payment error:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      code: 'PAYMENT_CONFIRM_FAILED',
      details: error.message
    });
  }
};

const getPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await getPaymentsByStatus('pending');

    res.json({
      success: true,
      data: pendingPayments
    });

  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({
      error: 'Failed to get pending payments',
      code: 'PENDING_PAYMENTS_FETCH_FAILED'
    });
  }
};

const getPaymentStatsForKasir = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    const startDate = date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = date_to || new Date();

    const stats = await getPaymentStatistics(startDate, endDate);

    res.json({
      success: true,
      data: {
        period: {
          start_date: startDate,
          end_date: endDate
        },
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Get payment stats for kasir error:', error);
    res.status(500).json({
      error: 'Failed to get payment statistics'
    });
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
          count: 0,
          total_amount: 0
        };
      }
      acc[payment.method].count++;
      acc[payment.method].total_amount += parseFloat(payment.total_amount);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        date: date,
        summary: stats,
        method_breakdown: methodBreakdown,
        total_transactions: dailyPayments.length
      }
    });

  } catch (error) {
    console.error('Get daily cash report error:', error);
    res.status(500).json({
      error: 'Failed to get daily cash report'
    });
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

    res.json({
      success: true,
      data: {
        bookings: paginatedBookings,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: bookings.length,
          total_pages: Math.ceil(bookings.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all bookings kasir error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bookings',
      code: 'KASIR_BOOKINGS_FETCH_FAILED'
    });
  }
};

// Get booking detail for kasir (payment related)
const getBookingDetailForKasir = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        code: 'BOOKING_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking detail kasir error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get booking detail',
      code: 'KASIR_BOOKING_DETAIL_FAILED'
    });
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
