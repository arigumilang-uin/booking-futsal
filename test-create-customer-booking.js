// Test Script: Create Customer Booking for Payment Testing
// This script creates new bookings as customer to test kasir payment confirmation

import axios from 'axios';

const BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Test credentials
const customerCredentials = { email: 'ppwweebb05@gmail.com', password: 'futsaluas' };

let authCookies = '';

// Create axios instance with cookie support
const axiosInstance = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login as customer
async function loginAsCustomer() {
  try {
    console.log('🔐 Logging in as customer...');
    const response = await axiosInstance.post(`${BASE_URL}/auth/login`, customerCredentials);

    if (response.data.success) {
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        authCookies = cookies.join('; ');
        console.log('✅ Customer login successful');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('❌ Customer login failed:', error.response?.data || error.message);
    return false;
  }
}

// Get available fields
async function getAvailableFields() {
  try {
    console.log('\n📋 Getting available fields...');
    const response = await axiosInstance.get(`${BASE_URL}/customer/fields`, {
      headers: { 'Cookie': authCookies }
    });

    if (response.data.success) {
      const fields = response.data.data;
      console.log(`✅ Found ${fields.length} available fields`);

      if (fields.length > 0) {
        console.log('📋 Sample fields:');
        fields.slice(0, 3).forEach((field, index) => {
          console.log(`   ${index + 1}. ${field.name} - Rp ${field.price_per_hour}/hour`);
        });
      }

      return fields;
    }

    return [];
  } catch (error) {
    console.error('❌ Failed to get fields:', error.response?.data || error.message);
    return [];
  }
}

// Create booking
async function createBooking(field, timeSlot = { start: '10:00', end: '12:00' }) {
  try {
    console.log(`\n📅 Creating booking for field ${field.id} (${field.name}) at ${timeSlot.start}-${timeSlot.end}...`);

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingDate = tomorrow.toISOString().split('T')[0];

    // Use default price if not available
    const pricePerHour = field.price_per_hour || field.price || 50000; // Default 50k

    const bookingData = {
      field_id: field.id,
      date: bookingDate,
      start_time: timeSlot.start,
      end_time: timeSlot.end,
      name: 'Test Customer', // Required field
      phone: '081234567890', // Required field
      email: 'ppwweebb05@gmail.com', // Optional but good to include
      notes: `Test booking for payment confirmation - ${new Date().toISOString()}`
    };

    const response = await axiosInstance.post(
      `${BASE_URL}/customer/bookings`,
      bookingData,
      {
        headers: { 'Cookie': authCookies }
      }
    );

    if (response.data.success) {
      const booking = response.data.data;
      console.log('✅ Booking created successfully!');
      console.log('📄 Booking details:', {
        id: booking.id,
        booking_number: booking.booking_number,
        field_id: booking.field_id,
        date: booking.date,
        time: `${booking.start_time} - ${booking.end_time}`,
        amount: booking.total_amount,
        payment_status: booking.payment_status
      });

      return booking;
    }

    return null;
  } catch (error) {
    console.error(`❌ Booking creation failed:`, {
      status: error.response?.status,
      error: error.response?.data?.error,
      details: error.response?.data?.details
    });

    return null;
  }
}

// Verify booking was created
async function verifyBooking(bookingId) {
  try {
    console.log(`\n🔍 Verifying booking ${bookingId}...`);
    const response = await axiosInstance.get(`${BASE_URL}/customer/bookings/${bookingId}`, {
      headers: { 'Cookie': authCookies }
    });

    if (response.data.success) {
      const booking = response.data.data;
      console.log('✅ Booking verification successful');
      console.log('📊 Booking status:', {
        id: booking.id,
        status: booking.status,
        payment_status: booking.payment_status,
        total_amount: booking.total_amount
      });

      return booking;
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to verify booking:', error.response?.data || error.message);
    return null;
  }
}

// Main test function
async function runCustomerBookingTest() {
  console.log('🚀 CUSTOMER BOOKING CREATION TEST');
  console.log('==================================\n');

  // Step 1: Login as customer
  const loginSuccess = await loginAsCustomer();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without customer login. Exiting...');
    return;
  }

  // Step 2: Get available fields
  const fields = await getAvailableFields();
  if (fields.length === 0) {
    console.log('❌ No fields available for booking. Exiting...');
    return;
  }

  // Step 3: Create multiple bookings for testing
  const testField = fields[0]; // Use first available field
  const numberOfBookings = 3;

  console.log(`\n🎯 Creating ${numberOfBookings} test bookings using field: ${testField.name}`);
  console.log(`💰 Field price: ${testField.price_per_hour || testField.price || 50000}`);

  const createdBookings = [];

  for (let i = 1; i <= numberOfBookings; i++) {
    console.log(`\n📋 Creating booking ${i}/${numberOfBookings}...`);

    // Use different time slots to avoid conflicts
    const timeSlots = [
      { start: '10:00', end: '12:00' },
      { start: '13:00', end: '15:00' },
      { start: '16:00', end: '18:00' }
    ];

    const booking = await createBooking(testField, timeSlots[i - 1]);

    if (booking) {
      createdBookings.push(booking);
      console.log(`✅ Booking ${i} created: ${booking.booking_number}`);

      // Verify booking
      await verifyBooking(booking.id);
    } else {
      console.log(`❌ Booking ${i} creation failed`);
    }

    // Wait between requests
    if (i < numberOfBookings) {
      console.log('⏳ Waiting 2 seconds before next booking...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Step 4: Final summary
  console.log('\n🏁 BOOKING CREATION SUMMARY:');
  console.log('============================');

  if (createdBookings.length > 0) {
    console.log(`✅ Successfully created ${createdBookings.length} bookings:`);
    createdBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.booking_number} - Rp ${booking.total_amount} (${booking.payment_status})`);
    });

    console.log('\n🎯 NEXT STEPS:');
    console.log('- Login as kasir (ppwweebb04@gmail.com/futsaluas)');
    console.log('- Go to "💳 Pembayaran" tab');
    console.log(`- You should see ${createdBookings.length} new pending payments`);
    console.log('- Test payment confirmation workflow');
  } else {
    console.log('❌ No bookings were created successfully');
  }

  console.log('\n🎉 CUSTOMER BOOKING TEST COMPLETED!');
  return createdBookings.length > 0;
}

// Run the test
runCustomerBookingTest().catch(console.error);
