const {
  updateCompletedBookings,
  getEligibleBookingsForCompletion,
  triggerManualCompletion,
  getAutoCompletionStats
} = require('../../utils/updateCompletedBookings');

/**
 * @route   POST /api/admin/auto-completion/trigger
 * @desc    Manually trigger auto-completion process
 * @access  Private (Admin, Supervisor)
 */
const triggerAutoCompletion = async (req, res) => {
  try {
    const adminId = req.rawUser.id;

    const completed = await updateCompletedBookings();

    // Log manual trigger
    const pool = require('../../config/db');
    await pool.query(`
      INSERT INTO audit_logs (
        user_id, action, table_name, resource_type, additional_info, created_at
      ) VALUES (
        $1, 'MANUAL_AUTO_COMPLETION_TRIGGER', 'bookings', 'system', $2, NOW()
      )
    `, [
      adminId,
      JSON.stringify({
        completed_count: completed.length,
        triggered_by: req.rawUser.name,
        employee_id: req.rawUser.employee_id,
        timestamp: new Date().toISOString()
      })
    ]);

    res.json({
      success: true,
      message: `Auto-completion process completed`,
      data: {
        completed_count: completed.length,
        completed_bookings: completed,
        triggered_by: req.rawUser.name,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Manual auto-completion trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger auto-completion',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/auto-completion/eligible
 * @desc    Get bookings eligible for auto-completion
 * @access  Private (Admin, Supervisor)
 */
const getEligibleBookings = async (req, res) => {
  try {
    const eligibleBookings = await getEligibleBookingsForCompletion();

    res.json({ success: true, data: {
        eligible_count: eligibleBookings.length,
        eligible_bookings: eligibleBookings,
        checked_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get eligible bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get eligible bookings',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/auto-completion/stats
 * @desc    Get auto-completion statistics
 * @access  Private (Admin, Supervisor)
 */
const getCompletionStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const stats = await getAutoCompletionStats(parseInt(days));

    // Get overall completion stats
    const pool = require('../../config/db');
    const overallStatsQuery = `
      SELECT
        COUNT(*) as total_completed,
        COUNT(CASE WHEN completed_by IS NULL THEN 1 END) as auto_completed,
        COUNT(CASE WHEN completed_by IS NOT NULL THEN 1 END) as manual_completed,
        CASE
          WHEN COUNT(*) > 0 THEN ROUND(
            COUNT(CASE WHEN completed_by IS NULL THEN 1 END) * 100.0 / COUNT(*), 2
          )
          ELSE 0
        END as auto_completion_percentage
      FROM bookings
      WHERE status = 'completed'
        AND completed_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
    `;

    const overallStats = await pool.query(overallStatsQuery);

    res.json({ success: true, data: {
        period_days: parseInt(days),
        overall_stats: overallStats.rows[0],
        daily_stats: stats,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get completion stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get completion statistics',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/admin/auto-completion/manual/:id
 * @desc    Manually complete a specific booking
 * @access  Private (Admin, Supervisor)
 */
const manualCompleteBooking = async (req, res) => {
  try {
    const adminId = req.rawUser.id;
    const { id } = req.params;
    const { reason } = req.body;

    const completedBooking = await triggerManualCompletion(
      parseInt(id),
      adminId,
      reason || `Manual completion by admin: ${req.rawUser.name}`
    );

    res.json({
      success: true,
      message: 'Booking completed manually',
      data: {
        booking: completedBooking,
        completed_by: req.rawUser.name,
        reason: reason || `Manual completion by admin: ${req.rawUser.name}`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Manual complete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete booking manually',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/auto-completion/config
 * @desc    Get auto-completion configuration
 * @access  Private (Admin, Supervisor)
 */
const getAutoCompletionConfig = async (req, res) => {
  try {
    const config = {
      enabled: process.env.ENABLE_AUTO_COMPLETION !== 'false',
      schedule: process.env.AUTO_COMPLETION_SCHEDULE || '*/30 * * * *',
      timezone: process.env.TZ || 'Asia/Jakarta',
      grace_period_minutes: 15,
      environment: process.env.NODE_ENV || 'production'
    };

    res.json({ success: true, data: {
        auto_completion_config: config,
        status: config.enabled ? 'active' : 'disabled',
        next_run_info: config.enabled ? 'Every 30 minutes' : 'Disabled',
        checked_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get auto-completion config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get auto-completion configuration',
      error: error.message
    });
  }
};

module.exports = {
  triggerAutoCompletion,
  getEligibleBookings,
  getCompletionStats,
  manualCompleteBooking,
  getAutoCompletionConfig
};
