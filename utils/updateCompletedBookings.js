const pool = require('../config/db');
const { updateBookingStatus } = require('../models/business/bookingModel');

const updateCompletedBookings = async () => {
  try {
    console.log('[AUTO-COMPLETION] Starting booking completion check...');

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 8);
    const currentDate = now.toISOString().split('T')[0];

    const expiredBookingsQuery = `
      SELECT 
        b.id, 
        b.uuid, 
        b.booking_number, 
        b.date, 
        b.start_time, 
        b.end_time,
        b.status,
        b.user_id,
        f.name as field_name,
        u.name as user_name
      FROM bookings b
      LEFT JOIN fields f ON b.field_id = f.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.status = 'confirmed'
        AND (
          (b.date < $1) OR 
          (b.date = $1 AND b.end_time <= $2)
        )
        AND b.completed_at IS NULL
      ORDER BY b.date ASC, b.end_time ASC
    `;

    const expiredBookings = await pool.query(expiredBookingsQuery, [currentDate, currentTime]);

    if (expiredBookings.rows.length === 0) {
      console.log('[AUTO-COMPLETION] No bookings to complete');
      return [];
    }

    console.log(`[AUTO-COMPLETION] Found ${expiredBookings.rows.length} bookings to complete`);

    const completedBookings = [];

    for (const booking of expiredBookings.rows) {
      try {
        console.log(`[AUTO-COMPLETION] 🔍 Checking booking ${booking.booking_number}:`);
        console.log(`  Raw data - Date: ${booking.date}, End time: ${booking.end_time}`);
        console.log(`  Date type: ${typeof booking.date}, Time type: ${typeof booking.end_time}`);

        // Validate date and time format
        if (!booking.date || !booking.end_time) {
          throw new Error(`Missing date or time data: date=${booking.date}, end_time=${booking.end_time}`);
        }

        // Convert date to ISO string format if it's a Date object
        let dateString;
        if (booking.date instanceof Date) {
          dateString = booking.date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        } else {
          dateString = booking.date.toString();
        }

        // Database stores time in WIB (UTC+7), convert to UTC for comparison
        const dateTimeString = `${dateString}T${booking.end_time}`;
        console.log(`  Converted date: ${dateString}`);
        console.log(`  DateTime string: ${dateTimeString}`);

        const bookingEndDateTime = new Date(dateTimeString);
        if (isNaN(bookingEndDateTime.getTime())) {
          throw new Error(`Invalid date format: ${dateTimeString}`);
        }

        // Subtract 7 hours to convert WIB to UTC
        const bookingEndUTC = new Date(bookingEndDateTime.getTime() - (7 * 60 * 60 * 1000));
        const gracePeriodEnd = new Date(bookingEndUTC.getTime() + (15 * 60 * 1000));

        console.log(`  End time WIB: ${booking.end_time} (${bookingEndDateTime.toISOString()})`);
        console.log(`  End time UTC: ${bookingEndUTC.toISOString()}`);
        console.log(`  Grace period ends: ${gracePeriodEnd.toISOString()}`);
        console.log(`  Current time: ${now.toISOString()}`);
        console.log(`  Should complete: ${now >= gracePeriodEnd}`);

        if (now >= gracePeriodEnd) {
          const updatedBooking = await updateBookingStatus(
            booking.id,
            'completed',
            null,
            `Auto-completed by system at ${now.toISOString()}`
          );

          completedBookings.push({
            id: booking.id,
            booking_number: booking.booking_number,
            field_name: booking.field_name,
            user_name: booking.user_name,
            date: booking.date,
            end_time: booking.end_time,
            completed_at: updatedBooking.completed_at
          });

          console.log(`[AUTO-COMPLETION] ✅ Completed booking ${booking.booking_number} (${booking.field_name})`);
        } else {
          console.log(`[AUTO-COMPLETION] ⏳ Booking ${booking.booking_number} still in grace period`);
        }

      } catch (error) {
        console.error(`[AUTO-COMPLETION] ❌ Failed to complete booking ${booking.booking_number}:`, error.message);
        await logAutoCompletionError(booking.id, error.message);
      }
    }

    if (completedBookings.length > 0) {
      console.log(`[AUTO-COMPLETION] ✅ Successfully completed ${completedBookings.length} bookings`);
      await logAutoCompletionSuccess(completedBookings.length);
    }

    return completedBookings;

  } catch (error) {
    console.error('[AUTO-COMPLETION] ❌ System error during auto-completion:', error);
    throw error;
  }
};

const triggerManualCompletion = async (bookingId, adminUserId, reason = 'Manual completion by admin') => {
  try {
    const booking = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);

    if (booking.rows.length === 0) {
      throw new Error('Booking not found');
    }

    if (booking.rows[0].status !== 'confirmed') {
      throw new Error('Booking is not in confirmed status');
    }

    const updatedBooking = await updateBookingStatus(
      bookingId,
      'completed',
      adminUserId,
      reason
    );

    console.log(`[MANUAL-COMPLETION] ✅ Manually completed booking ${booking.rows[0].booking_number}`);

    return updatedBooking;

  } catch (error) {
    console.error('[MANUAL-COMPLETION] ❌ Error in manual completion:', error);
    throw error;
  }
};

const logAutoCompletionError = async (bookingId, errorMessage) => {
  try {
    // Log to audit_logs table instead of system_logs
    const query = `
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id,
        resource_type, resource_id, additional_info, created_at
      ) VALUES (
        NULL, 'AUTO_COMPLETION_ERROR', 'bookings', $1,
        'booking', $1, $2, NOW()
      )
    `;

    const metadata = JSON.stringify({
      booking_id: bookingId,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      source: 'auto_completion_cron'
    });

    await pool.query(query, [bookingId, metadata]);

  } catch (logError) {
    console.error('[AUTO-COMPLETION] Failed to log error:', logError);
  }
};

const logAutoCompletionSuccess = async (completedCount) => {
  try {
    // Log to audit_logs table instead of system_logs
    const query = `
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id,
        resource_type, resource_id, additional_info, created_at
      ) VALUES (
        NULL, 'AUTO_COMPLETION_SUCCESS', 'bookings', NULL,
        'system', NULL, $1, NOW()
      )
    `;

    const metadata = JSON.stringify({
      completed_count: completedCount,
      timestamp: new Date().toISOString(),
      source: 'auto_completion_cron',
      message: `Auto-completion successful: ${completedCount} bookings completed`
    });

    await pool.query(query, [metadata]);

  } catch (logError) {
    console.error('[AUTO-COMPLETION] Failed to log success:', logError);
  }
};

/**
 * Get bookings eligible for auto-completion (for monitoring)
 */
const getEligibleBookingsForCompletion = async () => {
  try {
    const query = `
      SELECT
        b.id,
        b.uuid,
        b.booking_number,
        b.date as booking_date,
        b.start_time,
        b.end_time,
        b.status,
        b.total_amount,
        u.name as customer_name,
        u.email as customer_email,
        f.name as field_name,
        EXTRACT(EPOCH FROM (NOW() - (b.date::date + b.end_time + INTERVAL '15 minutes'))) / 60 as minutes_overdue
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN fields f ON b.field_id = f.id
      WHERE b.status = 'confirmed'
        AND b.completed_at IS NULL
        AND (
          b.date < CURRENT_DATE
          OR (
            b.date = CURRENT_DATE
            AND b.end_time <= CURRENT_TIME - INTERVAL '15 minutes'
          )
        )
      ORDER BY b.date DESC, b.end_time DESC
    `;

    const result = await pool.query(query);
    return result.rows;

  } catch (error) {
    console.error('[GET-ELIGIBLE] Error getting eligible bookings:', error);
    throw error;
  }
};

const getAutoCompletionStats = async (days = 7) => {
  try {
    const query = `
      SELECT
        DATE(completed_at) as completion_date,
        COUNT(*) as completed_count,
        COUNT(CASE WHEN completed_by IS NULL THEN 1 END) as auto_completed_count,
        COUNT(CASE WHEN completed_by IS NOT NULL THEN 1 END) as manual_completed_count,
        ROUND(AVG(total_amount), 2) as avg_booking_value
      FROM bookings
      WHERE status = 'completed'
        AND completed_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(completed_at)
      ORDER BY completion_date DESC
    `;

    const result = await pool.query(query);
    return result.rows;

  } catch (error) {
    console.error('[AUTO-COMPLETION] Error getting stats:', error);
    throw error;
  }
};

module.exports = {
  updateCompletedBookings,
  getEligibleBookingsForCompletion,
  triggerManualCompletion,
  getAutoCompletionStats
};
