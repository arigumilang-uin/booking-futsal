// Shared Analytics Controller - Consolidated analytics functions
const {
  getAllUsers,
  getStaffUsers
} = require('../../models/core/userModel');
const {
  getFieldStatistics
} = require('../../models/business/fieldModel');
const {
  getBookingStatistics,
  getRevenueStatistics
} = require('../../models/business/bookingModel');
const {
  getPaymentStatistics
} = require('../../models/business/paymentModel');

// Get business analytics (for managers)
const getBusinessAnalytics = async (req, res) => {
  try {
    const { date_from, date_to, period = 'month' } = req.query;

    let startDate, endDate;

    if (date_from && date_to) {
      startDate = new Date(date_from);
      endDate = new Date(date_to);
    } else {
      const today = new Date();
      if (period === 'week') {
        startDate = new Date(today.setDate(today.getDate() - 7));
        endDate = new Date();
      } else if (period === 'year') {
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
      } else { // month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }
    }

    const [bookingStats, revenueStats, paymentStats] = await Promise.all([
      getBookingStatistics(startDate, endDate),
      getRevenueStatistics(startDate, endDate),
      getPaymentStatistics(startDate, endDate)
    ]);

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          period: {
          start_date: startDate,
          end_date: endDate,
          period_type: period
          },
          booking_analytics: bookingStats,
          revenue_analytics: revenueStats,
          payment_analytics: paymentStats
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get business analytics error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil analitik bisnis'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get system analytics (for supervisors)
const getSystemAnalytics = async (req, res) => {
  try {
    const { date_from, date_to, period = 'month' } = req.query;

    let startDate, endDate;

    if (date_from && date_to) {
      startDate = new Date(date_from);
      endDate = new Date(date_to);
    } else {
      const today = new Date();
      if (period === 'week') {
        startDate = new Date(today.setDate(today.getDate() - 7));
        endDate = new Date();
      } else if (period === 'year') {
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
      } else { // month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }
    }

    const [bookingStats, revenueStats, paymentStats, fieldStats] = await Promise.all([
      getBookingStatistics(startDate, endDate),
      getRevenueStatistics(startDate, endDate),
      getPaymentStatistics(startDate, endDate),
      getFieldStatistics()
    ]);

    const allUsers = await getAllUsers();

    res.json({ success: true, data: {
        period: {
          start_date: startDate,
          end_date: endDate,
          period_type: period
        },
        system_analytics: {
          users: {
            total: allUsers.length,
            by_role: allUsers.reduce((acc, user) => {
              acc[user.role] = (acc[user.role] || 0) + 1;
              return acc;
            }, {}),
            // Monitoring data object
            const monitoringData = {
              active: allUsers.filter(u => u.is_active).length,
              inactive: allUsers.filter(u => !u.is_active).length
              },
              bookings: bookingStats,
              revenue: revenueStats,
              payments: paymentStats,
              fields: fieldStats
              }
              }
            };
            // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil analitik sistem'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get dashboard overview (shared function)
const getDashboardOverview = async (userRole, userId) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [bookingStats, revenueStats, paymentStats, fieldStats] = await Promise.all([
      getBookingStatistics(startOfMonth, endOfMonth),
      getRevenueStatistics(startOfMonth, endOfMonth),
      getPaymentStatistics(startOfMonth, endOfMonth),
      getFieldStatistics()
    ]);

    const allUsers = await getAllUsers();
    const staffUsers = await getStaffUsers();

    return {
      period: {
        start_date: startOfMonth,
        end_date: endOfMonth
      },
      overview: {
        total_revenue: revenueStats.total_revenue || 0,
        total_bookings: bookingStats.total_bookings || 0,
        total_customers: bookingStats.unique_customers || 0,
        total_fields: fieldStats.total_fields || 0,
        active_fields: fieldStats.active_fields || 0,
        total_users: allUsers.length,
        total_staff: staffUsers.length
      },
      statistics: {
        bookings: bookingStats,
        revenue: revenueStats,
        payments: paymentStats,
        fields: fieldStats,
        users: {
          total: allUsers.length,
          by_role: allUsers.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {}),
          active: allUsers.filter(u => u.is_active).length,
          staff_count: staffUsers.length
        }
      }
    };
  } catch (error) {
    throw error;
  }
};

// Get performance metrics
const getPerformanceMetrics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const today = new Date();
    let startDate, endDate;

    if (period === 'week') {
      startDate = new Date(today.setDate(today.getDate() - 7));
      endDate = new Date();
    } else if (period === 'year') {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
    } else { // month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    const [bookingStats, revenueStats, fieldStats] = await Promise.all([
      getBookingStatistics(startDate, endDate),
      getRevenueStatistics(startDate, endDate),
      getFieldStatistics()
    ]);

    // Calculate performance metrics
    const metrics = {
      occupancy_rate: fieldStats.total_fields > 0 ?
        (bookingStats.total_bookings / (fieldStats.total_fields * 30)) * 100 : 0,
      revenue_per_booking: bookingStats.total_bookings > 0 ?
        revenueStats.total_revenue / bookingStats.total_bookings : 0,
      average_booking_value: revenueStats.average_booking_value || 0,
      customer_retention: bookingStats.returning_customers || 0,
      field_utilization: fieldStats.utilization_rate || 0
    };

    res.json({ success: true, data: {
        period: {
          start_date: startDate,
          end_date: endDate,
          // Monitoring data object
          const monitoringData = {
            period_type: period
            },
            performance_metrics: metrics,
            raw_statistics: {
            bookings: bookingStats,
            revenue: revenueStats,
            fields: fieldStats
            }
            }
          };
          // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil metrik performa'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  getBusinessAnalytics,
  getSystemAnalytics,
  getDashboardOverview,
  getPerformanceMetrics
};
