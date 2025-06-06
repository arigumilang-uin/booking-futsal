// debug/count-all-endpoints.js - Count All Endpoints in Backend
const fs = require('fs');
const path = require('path');

// Daftar file routes yang akan diperiksa
const ROUTE_FILES = [
  'routes/indexRoutes.js',
  'routes/testRoutes.js',
  'routes/authRoutes.js',
  'routes/publicRoutes.js',
  'routes/customerRoutes.js',
  'routes/kasirRoutes.js',
  'routes/operatorRoutes.js',
  'routes/manajerRoutes.js',
  'routes/supervisorRoutes.js',
  'routes/adminRoutes.js',
  'routes/enhancedRoutes.js'
];

// Regex patterns untuk mendeteksi endpoint
const ENDPOINT_PATTERNS = [
  /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
  /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g
];

function extractEndpointsFromFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const endpoints = [];

    // Extract endpoints using regex patterns
    ENDPOINT_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        const path = match[2];
        
        // Skip middleware-only routes or invalid paths
        if (path && !path.includes('*') && !path.startsWith('//')) {
          endpoints.push({
            method,
            path,
            file: filePath
          });
        }
      }
    });

    return endpoints;
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return [];
  }
}

function getBasePath(fileName) {
  const basePaths = {
    'indexRoutes.js': '/api',
    'testRoutes.js': '/api/test',
    'authRoutes.js': '/api/auth',
    'publicRoutes.js': '/api/public',
    'customerRoutes.js': '/api/customer',
    'kasirRoutes.js': '/api/staff/kasir',
    'operatorRoutes.js': '/api/staff/operator',
    'manajerRoutes.js': '/api/staff/manager',
    'supervisorRoutes.js': '/api/staff/supervisor',
    'adminRoutes.js': '/api/admin',
    'enhancedRoutes.js': '/api/enhanced'
  };
  
  const fileName_ = path.basename(fileName);
  return basePaths[fileName_] || '/api';
}

function countAllEndpoints() {
  console.log('🔍 Counting All Endpoints in Backend...\n');

  let totalEndpoints = 0;
  const endpointsByFile = {};
  const allEndpoints = [];

  // Process each route file
  ROUTE_FILES.forEach(filePath => {
    console.log(`📁 Processing: ${filePath}`);
    
    const endpoints = extractEndpointsFromFile(filePath);
    const basePath = getBasePath(filePath);
    
    // Add base path to endpoints
    const fullEndpoints = endpoints.map(ep => ({
      ...ep,
      fullPath: basePath + (ep.path.startsWith('/') ? ep.path : '/' + ep.path)
    }));

    endpointsByFile[filePath] = fullEndpoints;
    allEndpoints.push(...fullEndpoints);
    totalEndpoints += fullEndpoints.length;

    console.log(`   📊 Found ${fullEndpoints.length} endpoints`);
    
    // Show first few endpoints as sample
    fullEndpoints.slice(0, 3).forEach(ep => {
      console.log(`      ${ep.method} ${ep.fullPath}`);
    });
    if (fullEndpoints.length > 3) {
      console.log(`      ... and ${fullEndpoints.length - 3} more`);
    }
    console.log('');
  });

  // Summary by category
  console.log('📊 SUMMARY BY CATEGORY:');
  Object.entries(endpointsByFile).forEach(([file, endpoints]) => {
    const fileName = path.basename(file);
    console.log(`   ${fileName}: ${endpoints.length} endpoints`);
  });

  console.log(`\n🎯 TOTAL ENDPOINTS: ${totalEndpoints}`);

  // Group by HTTP method
  const methodCounts = {};
  allEndpoints.forEach(ep => {
    methodCounts[ep.method] = (methodCounts[ep.method] || 0) + 1;
  });

  console.log('\n📈 BY HTTP METHOD:');
  Object.entries(methodCounts).forEach(([method, count]) => {
    console.log(`   ${method}: ${count} endpoints`);
  });

  // Show all unique endpoints
  console.log('\n📋 ALL ENDPOINTS:');
  const uniqueEndpoints = [...new Set(allEndpoints.map(ep => `${ep.method} ${ep.fullPath}`))];
  uniqueEndpoints.sort().forEach((endpoint, index) => {
    console.log(`${(index + 1).toString().padStart(3, ' ')}. ${endpoint}`);
  });

  console.log(`\n✅ FINAL COUNT: ${uniqueEndpoints.length} unique endpoints`);

  // Save to file
  const output = {
    total_endpoints: uniqueEndpoints.length,
    by_file: endpointsByFile,
    by_method: methodCounts,
    all_endpoints: uniqueEndpoints,
    generated_at: new Date().toISOString()
  };

  fs.writeFileSync('./debug/all-endpoints.json', JSON.stringify(output, null, 2));
  console.log('\n💾 Results saved to ./debug/all-endpoints.json');

  return output;
}

// Run the count
countAllEndpoints();
