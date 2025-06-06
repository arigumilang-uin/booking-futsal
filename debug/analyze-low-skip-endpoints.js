// debug/analyze-low-skip-endpoints.js - Analyze LOW and SKIP Priority Endpoints
const fs = require('fs');

// Load the priority data
const priorityData = JSON.parse(fs.readFileSync('./debug/endpoint-priorities.json', 'utf8'));

// Endpoint descriptions
const ENDPOINT_DESCRIPTIONS = {
  // LOW PRIORITY (4) - Utility/Info endpoints
  'GET /api/enhanced/': 'Enhanced features overview page - informational only',
  'GET /api/enhanced/architecture': 'System architecture documentation - for developers',
  'GET /api/enhanced/features': 'Detailed features list - marketing/info page',
  'GET /api/enhanced/status': 'Enhanced system status - monitoring',
  'GET /api/health': 'Basic API health check - monitoring',
  'GET /api/routes': 'List all available routes - development utility',
  'GET /api/test/health': 'Test environment health check - development only',
  'GET /api/test/routes': 'Test routes listing - development only',

  // SKIP PRIORITY (5) - Debug/Test endpoints
  'GET /api/public/debug/table/:tableName': 'Database table structure debug - development only',
  'GET /api/public/debug/test-promotion': 'Test promotion creation - development only',
  'GET /api/public/debug/test-settings': 'Test settings insertion - development only',
  'GET /api/test/admin': 'Test admin functionality - development only',
  'GET /api/test/auth': 'Test authentication - development only',
  'GET /api/test/customer': 'Test customer functionality - development only',
  'GET /api/test/database': 'Test database connection - development only',
  'GET /api/test/environment': 'Test environment variables - development only',
  'GET /api/test/memory': 'Test memory usage - development only',
  'GET /api/test/public': 'Test public functionality - development only',
  'GET /api/test/staff': 'Test staff functionality - development only'
};

function analyzeLowSkipEndpoints() {
  console.log('🔍 ANALISIS ENDPOINT LOW & SKIP PRIORITY\n');

  const lowPriority = priorityData.prioritized_endpoints["4"];
  const skipPriority = priorityData.prioritized_endpoints["5"];

  console.log('🔧 LOW PRIORITY ENDPOINTS (8 endpoints):');
  console.log('   📝 Kategori: Utility/Monitoring endpoints');
  console.log('   🎯 Fungsi: Informasi sistem, monitoring, dokumentasi');
  console.log('   📋 Rekomendasi: Optional untuk dokumentasi\n');

  lowPriority.forEach((endpoint, index) => {
    const description = ENDPOINT_DESCRIPTIONS[endpoint] || 'No description available';
    console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${endpoint}`);
    console.log(`       💡 ${description}\n`);
  });

  console.log('🚫 SKIP PRIORITY ENDPOINTS (11 endpoints):');
  console.log('   📝 Kategori: Debug/Test endpoints');
  console.log('   🎯 Fungsi: Development, testing, debugging');
  console.log('   📋 Rekomendasi: SKIP dokumentasi (internal use only)\n');

  skipPriority.forEach((endpoint, index) => {
    const description = ENDPOINT_DESCRIPTIONS[endpoint] || 'No description available';
    console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${endpoint}`);
    console.log(`       💡 ${description}\n`);
  });

  console.log('📊 SUMMARY:');
  console.log(`   🔧 LOW Priority: ${lowPriority.length} endpoints - Utility/monitoring`);
  console.log(`   🚫 SKIP Priority: ${skipPriority.length} endpoints - Debug/test only`);
  console.log(`   📈 Total excluded from main docs: ${lowPriority.length + skipPriority.length} endpoints`);
  console.log(`   🎯 Focus documentation on: ${190 - lowPriority.length - skipPriority.length} endpoints\n`);

  console.log('🎯 RECOMMENDATION:');
  console.log('   ✅ Document CRITICAL + HIGH + MEDIUM = 171 endpoints');
  console.log('   ⚠️  Optionally document LOW = 8 endpoints (utility)');
  console.log('   🚫 Skip SKIP priority = 11 endpoints (debug/test only)');
  console.log('   📋 Final target: 171-179 documented endpoints (90-94% coverage)\n');

  // Categorize by purpose
  const categories = {
    'Enhanced Info': lowPriority.filter(e => e.includes('/enhanced/')),
    'Health/Monitoring': lowPriority.filter(e => e.includes('/health') || e.includes('/routes')),
    'Debug Endpoints': skipPriority.filter(e => e.includes('/debug/')),
    'Test Endpoints': skipPriority.filter(e => e.includes('/test/'))
  };

  console.log('📂 CATEGORIZATION:');
  Object.entries(categories).forEach(([category, endpoints]) => {
    console.log(`   ${category}: ${endpoints.length} endpoints`);
    endpoints.forEach(endpoint => {
      console.log(`      - ${endpoint}`);
    });
    console.log('');
  });

  return {
    low_priority: lowPriority,
    skip_priority: skipPriority,
    categories: categories,
    recommendations: {
      document_target: 171,
      optional_target: 179,
      skip_count: skipPriority.length,
      total_coverage: '90-94%'
    }
  };
}

// Run analysis
const result = analyzeLowSkipEndpoints();

// Save results
fs.writeFileSync('./debug/low-skip-analysis.json', JSON.stringify(result, null, 2));
console.log('💾 Analysis saved to ./debug/low-skip-analysis.json');
