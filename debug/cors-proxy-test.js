// debug/cors-proxy-test.js
// Test CORS proxy configuration

console.log('🔧 CORS PROXY TEST');
console.log('==================\n');

// Test function to verify proxy is working
const testCorsProxy = async () => {
  console.log('🌐 Testing CORS proxy configuration...');
  
  try {
    // Test 1: Direct API call to relative URL (should use proxy)
    console.log('\n📡 Test 1: Relative URL API call (via proxy)');
    const response1 = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'ppwweebb01@gmail.com',
        password: 'futsaluas'
      }),
      credentials: 'include'
    });
    
    console.log('Response status:', response1.status);
    console.log('Response headers:', Object.fromEntries(response1.headers.entries()));
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Proxy login successful!');
      console.log('User:', data1.user);
      
      // Test 2: Authenticated API call
      console.log('\n📡 Test 2: Authenticated API call (via proxy)');
      const response2 = await fetch('/api/staff/supervisor/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Dashboard response status:', response2.status);
      
      if (response2.ok) {
        const data2 = await response2.json();
        console.log('✅ Dashboard API successful!');
        console.log('Overview data:', data2.data?.overview);
      } else {
        console.log('❌ Dashboard API failed:', response2.status);
      }
      
    } else {
      console.log('❌ Proxy login failed:', response1.status);
      const errorText = await response1.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ CORS proxy test failed:', error);
  }
};

// Browser environment test
if (typeof window !== 'undefined') {
  console.log('🌐 Running in browser environment');
  console.log('Current URL:', window.location.href);
  
  // Add test button to page
  const testButton = document.createElement('button');
  testButton.textContent = 'Test CORS Proxy';
  testButton.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  `;
  
  testButton.onclick = () => {
    console.clear();
    testCorsProxy();
  };
  
  document.body.appendChild(testButton);
  
  // Auto-run test
  setTimeout(testCorsProxy, 1000);
  
} else {
  console.log('📝 Running in Node.js environment');
  testCorsProxy();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCorsProxy };
}
