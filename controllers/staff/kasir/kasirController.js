const {
  getAllPayments,
  getPaymentById,
  getPaymentsByStatus,
  updatePaymentStatus,
  createPayment,
  getPaymentStatistics
} = require('../../../models/paymentModel');
const {
  getAllBookings,
  getBookingById,
  updateBookingStatus
} = require('../../../models/bookingModel');

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

    let payments = await getAllPayments(page, limit);

    if (status) {
      payments = payments.filter(payment => payment.status === status);
    }

    if (method) {
      payments = payments.filter(payment => payment.method === method);
    }

    if (date_from && date_to) {
      payments = payments.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate >= new Date(date_from) && paymentDate <= new Date(date_to);
      });
    }

    res.json({
      success: true,
      data: payments,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit)
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

    const payment = await createPayment({
      booking_id,
      method,
      provider: 'manual',
      amount,
      admin_fee: 0,
      status: 'paid',
      external_id: reference_number,
      notes,
      created_by: staffId
    });

    const updatedPayment = await updatePaymentStatus(
      payment.id,
      'paid',
      staffId,
      {
        notes: `Manual payment processed by staff: ${req.rawUser.name}`,
        gateway_response: {
          processed_by: req.rawUser.name,
          employee_id: req.rawUser.employee_id,
          processed_at: new Date().toISOString(),
          method: method,
          reference_number: reference_number
        }
      }
    );

    await updateBookingPaymentStatus(booking_id, 'paid');

    res.status(201).json({
      success: true,
      message: 'Manual payment processed successfully',
      data: updatedPayment
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
    const { notes } = req.body;

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

    // Update payment status
    const updatedPayment = await updatePaymentStatus(
      id,
      'paid',
      staffId,
      {
        notes: notes || `Payment confirmed by staff: ${req.rawUser.name}`,
        gateway_response: {
          confirmed_by: req.rawUser.name,
          employee_id: req.rawUser.employee_id,
          confirmed_at: new Date().toISOString()
        }
      }
    );

    // Update booking payment status
    await updateBookingPaymentStatus(payment.booking_id, 'paid');

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: updatedPayment
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      error: 'Failed to confirm payment',
      code: 'PAYMENT_CONFIRM_FAILED'
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

module.exports = {
  getAllPaymentsForKasir,
  getPaymentDetailForKasir,
  processManualPayment,
  confirmPayment,
  getPendingPayments,
  getPaymentStatsForKasir,
  getDailyCashReport
};
