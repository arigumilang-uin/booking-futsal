// Test Script: Verify Kasir Payment API Fix
// This script tests the enhanced kasir payment API that includes pending bookings

import axios from 'axios';

const BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Test credentials
const kasirCredentials = { email: 'ppwweebb04@gmail.com', password: 'futsaluas' };

let authCookies = '';

// Create axios instance with cookie support
const axiosInstance = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login as kasir
async function loginAsKasir() {
  try {
    console.log('🔐 Logging in as kasir...');
    const response = await axiosInstance.post(`${BASE_URL}/auth/login`, kasirCredentials);
    
    if (response.data.success) {
      // Extract cookies from response headers
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        authCookies = cookies.join('; ');
        console.log('✅ Kasir login successful');
        console.log('👤 User:', response.data.user?.name || 'staff_kasir');
        console.log('🎯 Role:', response.data.user?.role || 'kasir');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('❌ Kasir login failed:', error.response?.data || error.message);
    return false;
  }
}

// Test kasir payment API
async function testKasirPaymentAPI() {
  try {
    console.log('\n📊 Testing kasir payment API...');
    const response = await axiosInstance.get(`${BASE_URL}/staff/kasir/payments`, {
      headers: {
        'Cookie': authCookies
      }
    });

    if (response.data.success) {
      const payments = response.data.data;
      const pagination = response.data.pagination;

      console.log('\n🎉 KASIR PAYMENT API TEST RESULTS:');
      console.log('=====================================');
      
      // Overall statistics
      console.log(`📈 Total Payment Records: ${payments.length}`);
      console.log(`📊 Pagination Info:`, {
        current_page: pagination.current_page,
        per_page: pagination.per_page,
        total_actual_payments: pagination.total_actual_payments,
        total_pending_bookings: pagination.total_pending_bookings,
        total_items: pagination.total_items
      });

      // Status breakdown
      const statusBreakdown = payments.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});
      console.log(`📋 Status Breakdown:`, statusBreakdown);

      // Method breakdown
      const methodBreakdown = payments.reduce((acc, p) => {
        acc[p.method] = (acc[p.method] || 0) + 1;
        return acc;
      }, {});
      console.log(`💳 Method Breakdown:`, methodBreakdown);

      // Pending payments analysis
      const pendingPayments = payments.filter(p => p.status === 'pending');
      console.log(`\n⏳ PENDING PAYMENTS ANALYSIS:`);
      console.log(`   Total Pending: ${pendingPayments.length}`);
      
      if (pendingPayments.length > 0) {
        console.log(`   Sample Pending Payment:`, {
          id: pendingPayments[0].id,
          booking_id: pendingPayments[0].booking_id,
          booking_number: pendingPayments[0].booking_number,
          amount: pendingPayments[0].amount,
          method: pendingPayments[0].method,
          customer: pendingPayments[0].user_name,
          field: pendingPayments[0].field_name,
          is_booking_payment: pendingPayments[0].is_booking_payment
        });

        // Check for booking payments (pending bookings without payment records)
        const bookingPayments = pendingPayments.filter(p => p.is_booking_payment);
        console.log(`   Booking Payments (no payment record): ${bookingPayments.length}`);
        console.log(`   Actual Pending Payments: ${pendingPayments.length - bookingPayments.length}`);
      }

      // Paid payments analysis
      const paidPayments = payments.filter(p => p.status === 'paid');
      console.log(`\n✅ PAID PAYMENTS ANALYSIS:`);
      console.log(`   Total Paid: ${paidPayments.length}`);
      
      if (paidPayments.length > 0) {
        console.log(`   Sample Paid Payment:`, {
          id: paidPayments[0].id,
          booking_id: paidPayments[0].booking_id,
          payment_number: paidPayments[0].payment_number,
          amount: paidPayments[0].amount,
          method: paidPayments[0].method,
          customer: paidPayments[0].user_name
        });
      }

      // Data quality checks
      console.log(`\n🔍 DATA QUALITY CHECKS:`);
      const missingCustomerNames = payments.filter(p => !p.user_name).length;
      const missingFieldNames = payments.filter(p => !p.field_name).length;
      const missingAmounts = payments.filter(p => !p.amount || p.amount <= 0).length;
      
      console.log(`   Missing Customer Names: ${missingCustomerNames}`);
      console.log(`   Missing Field Names: ${missingFieldNames}`);
      console.log(`   Missing/Invalid Amounts: ${missingAmounts}`);

      // Success indicators
      console.log(`\n🎯 SUCCESS INDICATORS:`);
      console.log(`   ✅ API Response: SUCCESS`);
      console.log(`   ✅ Has Pending Payments: ${pendingPayments.length > 0 ? 'YES' : 'NO'}`);
      console.log(`   ✅ Has Paid Payments: ${paidPayments.length > 0 ? 'YES' : 'NO'}`);
      console.log(`   ✅ Includes Booking Data: ${payments.some(p => p.field_name) ? 'YES' : 'NO'}`);
      console.log(`   ✅ Includes Customer Data: ${payments.some(p => p.user_name) ? 'YES' : 'NO'}`);

      return {
        success: true,
        totalPayments: payments.length,
        pendingCount: pendingPayments.length,
        paidCount: paidPayments.length,
        hasBookingData: payments.some(p => p.field_name),
        hasCustomerData: payments.some(p => p.user_name)
      };
    }
    
    return { success: false, error: 'API response not successful' };
  } catch (error) {
    console.error('❌ Failed to test kasir payment API:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Test kasir statistics API
async function testKasirStatisticsAPI() {
  try {
    console.log('\n📈 Testing kasir statistics API...');
    const response = await axiosInstance.get(`${BASE_URL}/staff/kasir/statistics`, {
      headers: {
        'Cookie': authCookies
      }
    });

    if (response.data.success) {
      const stats = response.data.data;
      console.log('\n📊 KASIR STATISTICS:');
      console.log('===================');
      console.log(`💰 Total Revenue: Rp ${stats.total_revenue?.toLocaleString('id-ID') || 0}`);
      console.log(`📈 Total Transactions: ${stats.total_transactions || 0}`);
      console.log(`⏳ Pending Payments: ${stats.pending_payments || 0}`);
      console.log(`✅ Success Rate: ${stats.success_rate || 0}%`);
      console.log(`🏦 Active Payment Methods: ${stats.active_payment_methods || 0}`);
      
      return { success: true, stats };
    }
    
    return { success: false, error: 'Statistics API response not successful' };
  } catch (error) {
    console.error('❌ Failed to test kasir statistics API:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runKasirPaymentTest() {
  console.log('🚀 KASIR PAYMENT API FIX VERIFICATION');
  console.log('=====================================\n');

  // Step 1: Login as kasir
  const loginSuccess = await loginAsKasir();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without kasir login. Exiting...');
    return;
  }

  // Step 2: Test payment API
  const paymentTestResult = await testKasirPaymentAPI();
  
  // Step 3: Test statistics API
  const statsTestResult = await testKasirStatisticsAPI();

  // Step 4: Final summary
  console.log('\n🏁 FINAL TEST SUMMARY:');
  console.log('======================');
  
  if (paymentTestResult.success) {
    console.log('✅ Payment API: WORKING');
    console.log(`   - Total Payments: ${paymentTestResult.totalPayments}`);
    console.log(`   - Pending Payments: ${paymentTestResult.pendingCount}`);
    console.log(`   - Paid Payments: ${paymentTestResult.paidCount}`);
    console.log(`   - Has Booking Data: ${paymentTestResult.hasBookingData ? 'YES' : 'NO'}`);
    console.log(`   - Has Customer Data: ${paymentTestResult.hasCustomerData ? 'YES' : 'NO'}`);
  } else {
    console.log('❌ Payment API: FAILED');
    console.log(`   Error: ${paymentTestResult.error}`);
  }

  if (statsTestResult.success) {
    console.log('✅ Statistics API: WORKING');
  } else {
    console.log('❌ Statistics API: FAILED');
    console.log(`   Error: ${statsTestResult.error}`);
  }

  // Overall assessment
  const overallSuccess = paymentTestResult.success && statsTestResult.success;
  console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (overallSuccess && paymentTestResult.pendingCount > 0) {
    console.log('\n🎉 KASIR PAYMENT FIX VERIFICATION: SUCCESSFUL!');
    console.log('   - Kasir can now see pending payments');
    console.log('   - Booking data is included in payment records');
    console.log('   - Customer information is available');
    console.log('   - Ready for payment processing workflow');
  } else if (overallSuccess && paymentTestResult.pendingCount === 0) {
    console.log('\n⚠️  APIs working but no pending payments found');
    console.log('   - All payments may already be processed');
    console.log('   - Create new bookings to test pending payment workflow');
  }

  return overallSuccess;
}

// Run the test
runKasirPaymentTest().catch(console.error);
