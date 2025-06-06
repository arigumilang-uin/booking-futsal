// debug/test-swagger-endpoints.js - Test All Documented Swagger Endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

// Test endpoints yang sudah terdokumentasi
const DOCUMENTED_ENDPOINTS = [
  // Authentication
  { method: 'POST', path: '/api/auth/register', requiresAuth: false, requiresBody: true },
  { method: 'POST', path: '/api/auth/login', requiresAuth: false, requiresBody: true },
  { method: 'GET', path: '/api/auth/profile', requiresAuth: true, requiresBody: false },
  { method: 'GET', path: '/api/auth/roles', requiresAuth: false, requiresBody: false },
  
  // Public
  { method: 'GET', path: '/api/public/fields', requiresAuth: false, requiresBody: false },
  { method: 'GET', path: '/api/public/fields/1', requiresAuth: false, requiresBody: false },
  { method: 'GET', path: '/api/public/fields/1/availability?date=2024-12-01', requiresAuth: false, requiresBody: false },
  
  // Customer (requires auth)
  { method: 'GET', path: '/api/customer/profile', requiresAuth: true, requiresBody: false },
  { method: 'POST', path: '/api/customer/bookings', requiresAuth: true, requiresBody: true },
  { method: 'GET', path: '/api/customer/bookings', requiresAuth: true, requiresBody: false },
  { method: 'GET', path: '/api/customer/bookings/1', requiresAuth: true, requiresBody: false },
  { method: 'PUT', path: '/api/customer/bookings/1/cancel', requiresAuth: true, requiresBody: true },
  { method: 'GET', path: '/api/customer/dashboard', requiresAuth: true, requiresBody: false },
  { method: 'GET', path: '/api/customer/notifications', requiresAuth: true, requiresBody: false },
  { method: 'GET', path: '/api/customer/favorites', requiresAuth: true, requiresBody: false },
  
  // Staff Kasir (requires auth)
  { method: 'GET', path: '/api/staff/kasir/payments', requiresAuth: true, requiresBody: false },
  { method: 'POST', path: '/api/staff/kasir/payments/manual', requiresAuth: true, requiresBody: true },
  { method: 'GET', path: '/api/staff/kasir/dashboard', requiresAuth: true, requiresBody: false },
  { method: 'GET', path: '/api/staff/kasir/payment-methods', requiresAuth: true, requiresBody: false },
  
  // Staff Operator (requires auth)
  { method: 'GET', path: '/api/staff/operator/dashboard', requiresAuth: true, requiresBody: false },
  { method: 'PUT', path: '/api/staff/operator/bookings/1/confirm', requiresAuth: true, requiresBody: false },
  
  // Admin (requires auth)
  { method: 'GET', path: '/api/admin/bookings', requiresAuth: true, requiresBody: false },
  { method: 'POST', path: '/api/admin/auto-completion/trigger', requiresAuth: true, requiresBody: false }
];

async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  
  const options = {
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // Add auth header if required (we'll test without auth to see proper error responses)
  if (endpoint.requiresAuth) {
    // For testing, we expect 401 Unauthorized without token
    // This is actually the correct behavior
  }

  // Add body for POST/PUT requests
  if (endpoint.requiresBody && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
    if (endpoint.path.includes('/register')) {
      options.body = JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '081234567890'
      });
    } else if (endpoint.path.includes('/login')) {
      options.body = JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      });
    } else if (endpoint.path.includes('/bookings') && endpoint.method === 'POST') {
      options.body = JSON.stringify({
        field_id: 1,
        date: '2024-12-01',
        start_time: '10:00',
        end_time: '12:00',
        name: 'Test Booking',
        phone: '081234567890'
      });
    } else if (endpoint.path.includes('/cancel')) {
      options.body = JSON.stringify({
        reason: 'Test cancellation'
      });
    } else {
      options.body = JSON.stringify({});
    }
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      endpoint: `${endpoint.method} ${endpoint.path}`,
      status: response.status,
      success: response.status < 500, // 4xx is expected for auth endpoints, 5xx is server error
      response: data,
      requiresAuth: endpoint.requiresAuth
    };
  } catch (error) {
    return {
      endpoint: `${endpoint.method} ${endpoint.path}`,
      status: 'ERROR',
      success: false,
      error: error.message,
      requiresAuth: endpoint.requiresAuth
    };
  }
}

async function testAllEndpoints() {
  console.log('🧪 Testing All Documented Swagger Endpoints...\n');
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (const endpoint of DOCUMENTED_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.success) {
      successCount++;
      console.log(`✅ ${result.endpoint} - Status: ${result.status}`);
    } else {
      errorCount++;
      console.log(`❌ ${result.endpoint} - Status: ${result.status} - Error: ${result.error || 'Server Error'}`);
    }
  }
  
  console.log(`\n📊 Test Summary:`);
  console.log(`   Total Endpoints: ${DOCUMENTED_ENDPOINTS.length}`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📈 Success Rate: ${((successCount / DOCUMENTED_ENDPOINTS.length) * 100).toFixed(1)}%`);
  
  // Group by category
  console.log(`\n📋 Results by Category:`);
  const categories = {
    'Authentication': results.filter(r => r.endpoint.includes('/auth/')),
    'Public': results.filter(r => r.endpoint.includes('/public/')),
    'Customer': results.filter(r => r.endpoint.includes('/customer/')),
    'Staff': results.filter(r => r.endpoint.includes('/staff/')),
    'Admin': results.filter(r => r.endpoint.includes('/admin/'))
  };
  
  Object.entries(categories).forEach(([category, endpoints]) => {
    const categorySuccess = endpoints.filter(e => e.success).length;
    console.log(`   ${category}: ${categorySuccess}/${endpoints.length} successful`);
  });
  
  return results;
}

// Run tests
testAllEndpoints().catch(console.error);
