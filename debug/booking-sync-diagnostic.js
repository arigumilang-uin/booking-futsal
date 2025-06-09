// debug/booking-sync-diagnostic.js
/**
 * 🔍 BOOKING SYNCHRONIZATION DIAGNOSTIC TOOL
 * Investigasi masalah sinkronisasi data booking antara customer dan staff
 */

// Test credentials
const testCredentials = {
  customer: { email: 'ppwweebb05@gmail.com', password: 'futsaluas' },
  manager: { email: 'ppwweebb02@gmail.com', password: 'futsaluas' },
  kasir: { email: 'ppwweebb04@gmail.com', password: 'futsaluas' },
  operator: { email: 'ppwweebb03@gmail.com', password: 'futsaluas' }
};

const API_BASE = import.meta.env.VITE_API_URL || 'https://booking-futsal-production.up.railway.app/api';

// Helper function untuk login dan get token
const loginAndGetToken = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    if (data.success) {
      return { success: true, token: data.token, user: data.user };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Test booking creation sebagai customer
const testCustomerBookingCreation = async () => {
  console.log('🔍 TESTING CUSTOMER BOOKING CREATION');
  console.log('=' * 50);
  
  try {
    // Login sebagai customer
    const customerAuth = await loginAndGetToken(testCredentials.customer);
    if (!customerAuth.success) {
      console.log('❌ Customer login failed:', customerAuth.error);
      return null;
    }
    
    console.log('✅ Customer login successful:', customerAuth.user.name);
    
    // Create test booking
    const bookingData = {
      field_id: 1,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      start_time: '14:00',
      end_time: '16:00',
      name: 'Test Customer Booking',
      phone: '081234567890',
      notes: 'Test booking untuk investigasi sinkronisasi'
    };
    
    console.log('📋 Creating booking with data:', bookingData);
    
    const createResponse = await fetch(`${API_BASE}/customer/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerAuth.token}`
      },
      body: JSON.stringify(bookingData)
    });
    
    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Booking created successfully!');
      console.log('📊 Booking ID:', createResult.data.id);
      console.log('📊 Status:', createResult.data.status);
      console.log('📊 User ID:', createResult.data.user_id);
      
      return {
        bookingId: createResult.data.id,
        customerToken: customerAuth.token,
        customerUser: customerAuth.user,
        bookingData: createResult.data
      };
    } else {
      console.log('❌ Booking creation failed:', createResult.error);
      return null;
    }
    
  } catch (error) {
    console.log('❌ Customer booking creation error:', error.message);
    return null;
  }
};

// Test staff visibility untuk booking yang dibuat customer
const testStaffBookingVisibility = async (bookingInfo) => {
  console.log('\n🔍 TESTING STAFF BOOKING VISIBILITY');
  console.log('=' * 50);
  
  if (!bookingInfo) {
    console.log('❌ No booking info provided');
    return;
  }
  
  const staffRoles = ['manager', 'kasir', 'operator'];
  const staffEndpoints = {
    manager: '/staff/manager/bookings',
    kasir: '/staff/kasir/bookings',
    operator: '/staff/operator/bookings'
  };
  
  const results = {};
  
  for (const role of staffRoles) {
    console.log(`\n👤 Testing ${role.toUpperCase()} visibility...`);
    
    try {
      // Login sebagai staff
      const staffAuth = await loginAndGetToken(testCredentials[role]);
      if (!staffAuth.success) {
        console.log(`❌ ${role} login failed:`, staffAuth.error);
        results[role] = { success: false, error: 'Login failed' };
        continue;
      }
      
      console.log(`✅ ${role} login successful:`, staffAuth.user.name);
      
      // Get bookings dari staff endpoint
      const endpoint = staffEndpoints[role];
      console.log(`🔍 Checking endpoint: ${endpoint}`);
      
      const bookingsResponse = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${staffAuth.token}` }
      });
      
      const bookingsData = await bookingsResponse.json();
      
      if (bookingsData.success) {
        const bookings = bookingsData.data || [];
        console.log(`📊 ${role} can see ${bookings.length} total bookings`);
        
        // Check if our test booking is visible
        const testBooking = bookings.find(b => b.id === bookingInfo.bookingId);
        
        if (testBooking) {
          console.log(`✅ ${role} CAN see the test booking!`);
          console.log(`   - Booking ID: ${testBooking.id}`);
          console.log(`   - Status: ${testBooking.status}`);
          console.log(`   - Customer: ${testBooking.name}`);
          results[role] = { success: true, canSeeBooking: true, totalBookings: bookings.length };
        } else {
          console.log(`❌ ${role} CANNOT see the test booking`);
          console.log(`   - Total bookings visible: ${bookings.length}`);
          console.log(`   - Looking for booking ID: ${bookingInfo.bookingId}`);
          results[role] = { success: true, canSeeBooking: false, totalBookings: bookings.length };
        }
      } else {
        console.log(`❌ ${role} booking fetch failed:`, bookingsData.error);
        results[role] = { success: false, error: bookingsData.error };
      }
      
    } catch (error) {
      console.log(`❌ ${role} test error:`, error.message);
      results[role] = { success: false, error: error.message };
    }
  }
  
  return results;
};

// Test admin endpoint visibility
const testAdminBookingVisibility = async (bookingInfo) => {
  console.log('\n🔍 TESTING ADMIN BOOKING VISIBILITY');
  console.log('=' * 50);
  
  if (!bookingInfo) {
    console.log('❌ No booking info provided');
    return;
  }
  
  try {
    // Login sebagai manager (has admin access)
    const managerAuth = await loginAndGetToken(testCredentials.manager);
    if (!managerAuth.success) {
      console.log('❌ Manager login failed:', managerAuth.error);
      return;
    }
    
    console.log('✅ Manager login successful:', managerAuth.user.name);
    
    // Test admin endpoint
    console.log('🔍 Checking admin endpoint: /admin/bookings');
    
    const adminResponse = await fetch(`${API_BASE}/admin/bookings`, {
      headers: { 'Authorization': `Bearer ${managerAuth.token}` }
    });
    
    const adminData = await adminResponse.json();
    
    if (adminData.success) {
      const bookings = adminData.data?.bookings || adminData.data || [];
      console.log(`📊 Admin endpoint shows ${bookings.length} total bookings`);
      
      // Check if our test booking is visible
      const testBooking = bookings.find(b => b.id === bookingInfo.bookingId);
      
      if (testBooking) {
        console.log('✅ Admin endpoint CAN see the test booking!');
        console.log(`   - Booking ID: ${testBooking.id}`);
        console.log(`   - Status: ${testBooking.status}`);
        console.log(`   - Customer: ${testBooking.name}`);
        return { success: true, canSeeBooking: true, totalBookings: bookings.length };
      } else {
        console.log('❌ Admin endpoint CANNOT see the test booking');
        console.log(`   - Total bookings visible: ${bookings.length}`);
        console.log(`   - Looking for booking ID: ${bookingInfo.bookingId}`);
        return { success: true, canSeeBooking: false, totalBookings: bookings.length };
      }
    } else {
      console.log('❌ Admin booking fetch failed:', adminData.error);
      return { success: false, error: adminData.error };
    }
    
  } catch (error) {
    console.log('❌ Admin test error:', error.message);
    return { success: false, error: error.message };
  }
};

// Main diagnostic function
const diagnoseBookingSynchronization = async () => {
  console.log('🚀 BOOKING SYNCHRONIZATION DIAGNOSTIC');
  console.log('=' * 60);
  console.log('🎯 Goal: Investigate why staff cannot see customer bookings');
  console.log('📋 Process: Customer create → Staff verify visibility');
  console.log('');
  
  // Step 1: Create booking sebagai customer
  const bookingInfo = await testCustomerBookingCreation();
  
  if (!bookingInfo) {
    console.log('\n❌ DIAGNOSTIC FAILED: Could not create test booking');
    return;
  }
  
  // Wait a moment for potential database sync
  console.log('\n⏳ Waiting 2 seconds for potential database sync...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Test staff visibility
  const staffResults = await testStaffBookingVisibility(bookingInfo);
  
  // Step 3: Test admin visibility
  const adminResult = await testAdminBookingVisibility(bookingInfo);
  
  // Step 4: Generate diagnostic report
  console.log('\n📊 DIAGNOSTIC REPORT');
  console.log('=' * 50);
  console.log(`🆔 Test Booking ID: ${bookingInfo.bookingId}`);
  console.log(`👤 Created by: ${bookingInfo.customerUser.name} (${bookingInfo.customerUser.email})`);
  console.log(`📅 Booking Date: ${bookingInfo.bookingData.date}`);
  console.log(`⏰ Time: ${bookingInfo.bookingData.start_time} - ${bookingInfo.bookingData.end_time}`);
  console.log(`📊 Status: ${bookingInfo.bookingData.status}`);
  
  console.log('\n🔍 VISIBILITY RESULTS:');
  Object.entries(staffResults).forEach(([role, result]) => {
    const icon = result.canSeeBooking ? '✅' : '❌';
    console.log(`${icon} ${role.toUpperCase()}: ${result.canSeeBooking ? 'CAN' : 'CANNOT'} see booking (${result.totalBookings} total)`);
  });
  
  if (adminResult) {
    const icon = adminResult.canSeeBooking ? '✅' : '❌';
    console.log(`${icon} ADMIN: ${adminResult.canSeeBooking ? 'CAN' : 'CANNOT'} see booking (${adminResult.totalBookings} total)`);
  }
  
  // Analyze results
  const allCanSee = Object.values(staffResults).every(r => r.canSeeBooking);
  const noneCanSee = Object.values(staffResults).every(r => !r.canSeeBooking);
  
  console.log('\n🎯 ANALYSIS:');
  if (allCanSee) {
    console.log('✅ SUCCESS: All staff roles can see customer booking - synchronization working!');
  } else if (noneCanSee) {
    console.log('❌ PROBLEM: No staff roles can see customer booking - synchronization issue detected!');
    console.log('💡 Possible causes:');
    console.log('   - Database query filtering by user_id instead of showing all bookings');
    console.log('   - Different database tables being accessed');
    console.log('   - Caching issues preventing real-time sync');
    console.log('   - Permission/authorization filtering too restrictive');
  } else {
    console.log('⚠️ PARTIAL: Some staff roles can see booking, others cannot - inconsistent access');
  }
  
  console.log('\n🎉 DIAGNOSTIC COMPLETED!');
  
  return {
    bookingInfo,
    staffResults,
    adminResult,
    summary: { allCanSee, noneCanSee }
  };
};

// Make function globally available
window.diagnoseBookingSynchronization = diagnoseBookingSynchronization;
window.testCustomerBookingCreation = testCustomerBookingCreation;
window.testStaffBookingVisibility = testStaffBookingVisibility;
window.testAdminBookingVisibility = testAdminBookingVisibility;

console.log('🔍 Booking Sync Diagnostic loaded!');
console.log('📋 Available functions:');
console.log('  - diagnoseBookingSynchronization() - Full diagnostic test');
console.log('  - testCustomerBookingCreation() - Test customer booking creation');
console.log('  - testStaffBookingVisibility(bookingInfo) - Test staff visibility');
console.log('  - testAdminBookingVisibility(bookingInfo) - Test admin visibility');
console.log('🎯 Quick start: Run diagnoseBookingSynchronization()');
