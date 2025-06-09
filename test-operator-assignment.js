// test-operator-assignment.js
// Script untuk test operator assignment functionality

const BASE_URL = 'https://booking-futsal-production.up.railway.app/api';

// Test credentials
const SUPERVISOR_CREDS = {
  email: 'ppwweebb01@gmail.com',
  password: 'futsaluas'
};

const OPERATOR_CREDS = {
  email: 'ppwweebb03@gmail.com',
  password: 'futsaluas'
};

// Test functions
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Request failed:', error);
    return { status: 500, data: { error: error.message } };
  }
}

async function login(credentials) {
  console.log(`🔐 Logging in as ${credentials.email}...`);
  const result = await makeRequest(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  
  if (result.status === 200) {
    console.log('✅ Login successful');
    return result.data;
  } else {
    console.log('❌ Login failed:', result.data);
    return null;
  }
}

async function getOperators() {
  console.log('📋 Getting list of operators...');
  const result = await makeRequest(`${BASE_URL}/admin/operators`);
  
  if (result.status === 200) {
    console.log('✅ Operators retrieved:', result.data.data.length, 'operators found');
    result.data.data.forEach(op => {
      console.log(`  - ${op.name} (ID: ${op.id}) - ${op.is_available ? 'Available' : 'Assigned'}`);
    });
    return result.data.data;
  } else {
    console.log('❌ Failed to get operators:', result.data);
    return [];
  }
}

async function assignOperatorToField(fieldId, operatorId) {
  console.log(`🎯 Assigning operator ${operatorId} to field ${fieldId}...`);
  const result = await makeRequest(`${BASE_URL}/admin/fields/${fieldId}/assign-operator`, {
    method: 'PUT',
    body: JSON.stringify({ operator_id: operatorId })
  });
  
  if (result.status === 200) {
    console.log('✅ Operator assigned successfully:', result.data.data);
    return true;
  } else {
    console.log('❌ Failed to assign operator:', result.data);
    return false;
  }
}

async function updateFieldWithOperator(fieldId, operatorId) {
  console.log(`🔧 Updating field ${fieldId} with operator ${operatorId}...`);
  const result = await makeRequest(`${BASE_URL}/admin/fields/${fieldId}`, {
    method: 'PUT',
    body: JSON.stringify({ assigned_operator: operatorId })
  });
  
  if (result.status === 200) {
    console.log('✅ Field updated successfully');
    return true;
  } else {
    console.log('❌ Failed to update field:', result.data);
    return false;
  }
}

async function testOperatorBookingConfirm(bookingId) {
  console.log(`📝 Testing operator booking confirmation for booking ${bookingId}...`);
  const result = await makeRequest(`${BASE_URL}/staff/operator/bookings/${bookingId}/confirm`, {
    method: 'PUT',
    body: JSON.stringify({ notes: 'Test confirmation by assigned operator' })
  });
  
  if (result.status === 200) {
    console.log('✅ Booking confirmed successfully by operator');
    return true;
  } else {
    console.log('❌ Booking confirmation failed:', result.data);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Operator Assignment Tests\n');
  
  // Test 1: Login as supervisor
  const supervisorLogin = await login(SUPERVISOR_CREDS);
  if (!supervisorLogin) return;
  
  // Test 2: Get list of operators
  const operators = await getOperators();
  if (operators.length === 0) return;
  
  // Test 3: Assign operator to field using dedicated endpoint
  const testFieldId = 3;
  const testOperatorId = 3;
  
  const assignSuccess = await assignOperatorToField(testFieldId, testOperatorId);
  if (!assignSuccess) return;
  
  // Test 4: Login as operator
  const operatorLogin = await login(OPERATOR_CREDS);
  if (!operatorLogin) return;
  
  // Test 5: Try to confirm a booking (this should work now)
  const testBookingId = 8;
  await testOperatorBookingConfirm(testBookingId);
  
  // Test 6: Login back as supervisor and test alternative method
  await login(SUPERVISOR_CREDS);
  await updateFieldWithOperator(testFieldId, testOperatorId);
  
  console.log('\n🎉 All tests completed!');
}

// Run tests if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('Run runTests() in browser console to start tests');
  window.runTests = runTests;
} else {
  // Node.js environment
  runTests().catch(console.error);
}
