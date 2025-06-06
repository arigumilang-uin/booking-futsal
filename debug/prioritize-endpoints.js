// debug/prioritize-endpoints.js - Prioritize Endpoints for Documentation
const fs = require('fs');

// Load the endpoint data
const endpointData = JSON.parse(fs.readFileSync('./debug/all-endpoints.json', 'utf8'));

// Define priority levels
const PRIORITY_LEVELS = {
  CRITICAL: 1,    // Core business functionality
  HIGH: 2,        // Important features
  MEDIUM: 3,      // Enhanced features
  LOW: 4,         // Debug/test endpoints
  SKIP: 5         // Internal/debug only
};

// Priority rules
function getPriority(endpoint) {
  const path = endpoint.toLowerCase();
  const method = endpoint.split(' ')[0];

  // CRITICAL - Core business functionality
  if (path.includes('/auth/register') || path.includes('/auth/login')) return PRIORITY_LEVELS.CRITICAL;
  if (path.includes('/public/fields') && !path.includes('debug')) return PRIORITY_LEVELS.CRITICAL;
  if (path.includes('/customer/bookings') && method !== 'DELETE') return PRIORITY_LEVELS.CRITICAL;
  if (path.includes('/customer/profile')) return PRIORITY_LEVELS.CRITICAL;
  if (path.includes('/customer/dashboard')) return PRIORITY_LEVELS.CRITICAL;

  // HIGH - Important features
  if (path.includes('/auth/') && !path.includes('test') && !path.includes('debug')) return PRIORITY_LEVELS.HIGH;
  if (path.includes('/staff/kasir/payments')) return PRIORITY_LEVELS.HIGH;
  if (path.includes('/staff/operator/bookings')) return PRIORITY_LEVELS.HIGH;
  if (path.includes('/admin/bookings')) return PRIORITY_LEVELS.HIGH;
  if (path.includes('/customer/notifications')) return PRIORITY_LEVELS.HIGH;
  if (path.includes('/customer/favorites')) return PRIORITY_LEVELS.HIGH;

  // MEDIUM - Enhanced features
  if (path.includes('/customer/reviews')) return PRIORITY_LEVELS.MEDIUM;
  if (path.includes('/customer/promotions')) return PRIORITY_LEVELS.MEDIUM;
  if (path.includes('/admin/') && !path.includes('debug')) return PRIORITY_LEVELS.MEDIUM;
  if (path.includes('/staff/') && !path.includes('debug')) return PRIORITY_LEVELS.MEDIUM;
  if (path.includes('/public/') && !path.includes('debug')) return PRIORITY_LEVELS.MEDIUM;

  // LOW - Debug/utility endpoints
  if (path.includes('/health') || path.includes('/version') || path.includes('/routes')) return PRIORITY_LEVELS.LOW;
  if (path.includes('/enhanced/')) return PRIORITY_LEVELS.LOW;

  // SKIP - Debug/test only
  if (path.includes('/test/') || path.includes('/debug/') || path.includes('hash-password')) return PRIORITY_LEVELS.SKIP;

  return PRIORITY_LEVELS.MEDIUM; // Default
}

function prioritizeEndpoints() {
  console.log('🎯 Prioritizing Endpoints for Documentation...\n');

  const prioritized = {
    [PRIORITY_LEVELS.CRITICAL]: [],
    [PRIORITY_LEVELS.HIGH]: [],
    [PRIORITY_LEVELS.MEDIUM]: [],
    [PRIORITY_LEVELS.LOW]: [],
    [PRIORITY_LEVELS.SKIP]: []
  };

  // Categorize all endpoints
  endpointData.all_endpoints.forEach(endpoint => {
    const priority = getPriority(endpoint);
    prioritized[priority].push(endpoint);
  });

  // Display results
  const priorityNames = {
    [PRIORITY_LEVELS.CRITICAL]: 'CRITICAL',
    [PRIORITY_LEVELS.HIGH]: 'HIGH', 
    [PRIORITY_LEVELS.MEDIUM]: 'MEDIUM',
    [PRIORITY_LEVELS.LOW]: 'LOW',
    [PRIORITY_LEVELS.SKIP]: 'SKIP'
  };

  console.log('📊 ENDPOINT PRIORITIZATION RESULTS:\n');

  Object.entries(prioritized).forEach(([level, endpoints]) => {
    const name = priorityNames[level];
    const emoji = level == 1 ? '🔥' : level == 2 ? '⚡' : level == 3 ? '📋' : level == 4 ? '🔧' : '🚫';
    
    console.log(`${emoji} ${name} PRIORITY (${endpoints.length} endpoints):`);
    
    if (level <= 3) { // Show details for important priorities
      endpoints.forEach((endpoint, index) => {
        console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${endpoint}`);
      });
    } else {
      console.log(`   ${endpoints.length} endpoints (details hidden)`);
    }
    console.log('');
  });

  // Summary
  const criticalCount = prioritized[PRIORITY_LEVELS.CRITICAL].length;
  const highCount = prioritized[PRIORITY_LEVELS.HIGH].length;
  const mediumCount = prioritized[PRIORITY_LEVELS.MEDIUM].length;
  const totalImportant = criticalCount + highCount + mediumCount;

  console.log('🎯 DOCUMENTATION RECOMMENDATIONS:');
  console.log(`   🔥 CRITICAL: ${criticalCount} endpoints - MUST document`);
  console.log(`   ⚡ HIGH: ${highCount} endpoints - SHOULD document`);
  console.log(`   📋 MEDIUM: ${mediumCount} endpoints - NICE to document`);
  console.log(`   🔧 LOW: ${prioritized[PRIORITY_LEVELS.LOW].length} endpoints - Optional`);
  console.log(`   🚫 SKIP: ${prioritized[PRIORITY_LEVELS.SKIP].length} endpoints - Skip documentation`);
  console.log('');
  console.log(`📈 RECOMMENDED DOCUMENTATION TARGET: ${totalImportant} endpoints (${((totalImportant/190)*100).toFixed(1)}% of total)`);
  console.log(`📊 CURRENT DOCUMENTATION: 22 endpoints (11.6% of total)`);
  console.log(`📋 MISSING CRITICAL: ${Math.max(0, criticalCount - 22)} endpoints`);

  // Save results
  const output = {
    total_endpoints: 190,
    current_documented: 22,
    prioritized_endpoints: prioritized,
    recommendations: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      total_recommended: totalImportant,
      coverage_target: `${((totalImportant/190)*100).toFixed(1)}%`
    },
    generated_at: new Date().toISOString()
  };

  fs.writeFileSync('./debug/endpoint-priorities.json', JSON.stringify(output, null, 2));
  console.log('\n💾 Results saved to ./debug/endpoint-priorities.json');

  return output;
}

// Run prioritization
prioritizeEndpoints();
