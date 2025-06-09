// Test Script: Debug Customer Payment API 404 Error
// This script debugs why customer payment API returns 404

const axios = require('axios');

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

// Test different customer endpoints to see which work
async function testCustomerEndpoints() {
  const endpoints = [
    '/customer/profile',
    '/customer/bookings', 
    '/customer/payments',
    '/customer/notifications',
    '/customer/favorites'
  ];

  console.log('\n🔍 Testing all customer endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await axiosInstance.get(`${BASE_URL}${endpoint}`, {
        headers: { 'Cookie': authCookies }
      });
      
      console.log(`✅ ${endpoint}: ${response.status} - Working`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status || 'ERROR'} - ${error.response?.statusText || error.message}`);
      if (error.response?.status === 404) {
        console.log(`   📝 404 Details: ${JSON.stringify(error.response?.data)}`);
      }
    }
  }
}

// Main debug function
async function runCustomerPaymentDebug() {
  console.log('🔍 CUSTOMER PAYMENT API DEBUG');
  console.log('==============================\n');

  // Step 1: Login as customer
  const loginSuccess = await loginAsCustomer();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without customer login. Exiting...');
    return;
  }

  // Step 2: Test all customer endpoints
  await testCustomerEndpoints();

  console.log('\n🎉 CUSTOMER PAYMENT DEBUG COMPLETED!');
}

// Run the debug
runCustomerPaymentDebug().catch(console.error);
