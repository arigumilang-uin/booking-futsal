// Direct database check for tracking tables
const pool = require('./config/db');

async function checkTrackingTables() {
  try {
    console.log('🔍 CHECKING TRACKING TABLES IN DATABASE');
    console.log('=' .repeat(60));

    // Check booking_history table
    console.log('\n📋 BOOKING_HISTORY TABLE:');
    const bookingHistoryQuery = `
      SELECT bh.id, bh.booking_id, bh.status_from, bh.status_to, 
             bh.changed_by, bh.reason, bh.created_at,
             u.name as changed_by_name, u.role as changed_by_role,
             b.booking_number
      FROM booking_history bh
      LEFT JOIN users u ON bh.changed_by = u.id
      LEFT JOIN bookings b ON bh.booking_id = b.id
      ORDER BY bh.created_at DESC
      LIMIT 10
    `;
    
    const bookingHistoryResult = await pool.query(bookingHistoryQuery);
    console.log(`   Found ${bookingHistoryResult.rows.length} records:`);
    
    if (bookingHistoryResult.rows.length === 0) {
      console.log('   ❌ No records found in booking_history table');
    } else {
      bookingHistoryResult.rows.forEach((record, index) => {
        console.log(`   ${index + 1}. Booking ${record.booking_number || record.booking_id}: ${record.status_from} → ${record.status_to}`);
        console.log(`      Changed by: ${record.changed_by_name || 'Unknown'} (${record.changed_by_role || 'N/A'})`);
        console.log(`      Reason: ${record.reason || 'N/A'}`);
        console.log(`      Date: ${record.created_at}`);
        console.log('');
      });
    }

    // Check payment_logs table
    console.log('\n💳 PAYMENT_LOGS TABLE:');
    const paymentLogsQuery = `
      SELECT pl.id, pl.payment_id, pl.action, pl.status_from, pl.status_to,
             pl.amount, pl.notes, pl.processed_by, pl.created_at,
             u.name as processed_by_name, u.role as processed_by_role,
             p.payment_number
      FROM payment_logs pl
      LEFT JOIN users u ON pl.processed_by = u.id
      LEFT JOIN payments p ON pl.payment_id = p.id
      ORDER BY pl.created_at DESC
      LIMIT 10
    `;
    
    const paymentLogsResult = await pool.query(paymentLogsQuery);
    console.log(`   Found ${paymentLogsResult.rows.length} records:`);
    
    if (paymentLogsResult.rows.length === 0) {
      console.log('   ❌ No records found in payment_logs table');
    } else {
      paymentLogsResult.rows.forEach((record, index) => {
        console.log(`   ${index + 1}. Payment ${record.payment_number || record.payment_id}: ${record.action}`);
        console.log(`      Status: ${record.status_from || 'N/A'} → ${record.status_to || 'N/A'}`);
        console.log(`      Amount: ${record.amount || 'N/A'}`);
        console.log(`      Processed by: ${record.processed_by_name || 'System'} (${record.processed_by_role || 'N/A'})`);
        console.log(`      Notes: ${record.notes || 'N/A'}`);
        console.log(`      Date: ${record.created_at}`);
        console.log('');
      });
    }

    // Check recent bookings for comparison
    console.log('\n📅 RECENT BOOKINGS (for comparison):');
    const recentBookingsQuery = `
      SELECT id, booking_number, status, payment_status, created_at, updated_at
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const recentBookingsResult = await pool.query(recentBookingsQuery);
    console.log(`   Found ${recentBookingsResult.rows.length} recent bookings:`);
    
    recentBookingsResult.rows.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.booking_number}: ${booking.status} (payment: ${booking.payment_status})`);
      console.log(`      Created: ${booking.created_at}`);
      console.log(`      Updated: ${booking.updated_at}`);
      console.log('');
    });

    // Check recent payments for comparison
    console.log('\n💰 RECENT PAYMENTS (for comparison):');
    const recentPaymentsQuery = `
      SELECT id, payment_number, status, amount, method, created_at, updated_at
      FROM payments
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    const recentPaymentsResult = await pool.query(recentPaymentsQuery);
    console.log(`   Found ${recentPaymentsResult.rows.length} recent payments:`);
    
    recentPaymentsResult.rows.forEach((payment, index) => {
      console.log(`   ${index + 1}. ${payment.payment_number}: ${payment.status} (${payment.method})`);
      console.log(`      Amount: ${payment.amount}`);
      console.log(`      Created: ${payment.created_at}`);
      console.log(`      Updated: ${payment.updated_at}`);
      console.log('');
    });

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`✅ Booking History Records: ${bookingHistoryResult.rows.length}`);
    console.log(`✅ Payment Log Records: ${paymentLogsResult.rows.length}`);
    console.log(`✅ Recent Bookings: ${recentBookingsResult.rows.length}`);
    console.log(`✅ Recent Payments: ${recentPaymentsResult.rows.length}`);
    
    if (bookingHistoryResult.rows.length > 0 && paymentLogsResult.rows.length > 0) {
      console.log('\n🎉 SUCCESS: Both tracking tables are working and populated!');
      console.log('✅ booking_history table is logging status changes');
      console.log('✅ payment_logs table is logging payment activities');
    } else if (bookingHistoryResult.rows.length > 0) {
      console.log('\n⚠️ PARTIAL SUCCESS: booking_history is working, payment_logs needs attention');
    } else if (paymentLogsResult.rows.length > 0) {
      console.log('\n⚠️ PARTIAL SUCCESS: payment_logs is working, booking_history needs attention');
    } else {
      console.log('\n❌ ISSUE: Both tracking tables are empty - auto-logging may not be working');
    }

  } catch (error) {
    console.error('❌ Error checking tracking tables:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkTrackingTables();
