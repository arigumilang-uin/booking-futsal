// debug/generate-swagger-templates.js - Generate Swagger Documentation Templates
const fs = require('fs');

// Load endpoint data
const endpointData = JSON.parse(fs.readFileSync('./debug/all-endpoints.json', 'utf8'));
const priorityData = JSON.parse(fs.readFileSync('./debug/endpoint-priorities.json', 'utf8'));

// Currently documented endpoints (from debug output)
const DOCUMENTED_ENDPOINTS = [
  'POST /api/auth/register',
  'POST /api/auth/login', 
  'GET /api/auth/profile',
  'GET /api/auth/roles',
  'GET /api/public/fields',
  'GET /api/public/fields/{id}',
  'GET /api/public/fields/{id}/availability',
  'GET /api/public/fields/{fieldId}/reviews',
  'GET /api/public/fields/{fieldId}/rating',
  'GET /api/customer/profile',
  'POST /api/customer/bookings',
  'GET /api/customer/bookings',
  'GET /api/customer/bookings/history',
  'GET /api/customer/bookings/{id}',
  'PUT /api/customer/bookings/{id}/cancel',
  'GET /api/customer/dashboard',
  'GET /api/customer/notifications',
  'GET /api/customer/favorites',
  'GET /api/customer/bookings/{bookingId}/can-review',
  'GET /api/staff/kasir/payments',
  'POST /api/staff/kasir/payments/manual',
  'GET /api/staff/kasir/dashboard',
  'GET /api/staff/kasir/payment-methods',
  'GET /api/staff/operator/dashboard',
  'PUT /api/staff/operator/bookings/{id}/confirm',
  'GET /api/admin/bookings',
  'POST /api/admin/auto-completion/trigger'
];

function getSwaggerTag(endpoint) {
  if (endpoint.includes('/auth/')) return 'Authentication';
  if (endpoint.includes('/public/')) return 'Public';
  if (endpoint.includes('/customer/')) return 'Customer';
  if (endpoint.includes('/staff/kasir/')) return 'Staff Kasir';
  if (endpoint.includes('/staff/operator/')) return 'Staff Operator';
  if (endpoint.includes('/staff/manager/')) return 'Staff Manager';
  if (endpoint.includes('/staff/supervisor/')) return 'Staff Supervisor';
  if (endpoint.includes('/admin/')) return 'Admin';
  if (endpoint.includes('/enhanced/')) return 'Enhanced Features';
  return 'Other';
}

function generateSwaggerTemplate(endpoint) {
  const [method, path] = endpoint.split(' ');
  const tag = getSwaggerTag(endpoint);
  const pathForSwagger = path.replace(/:(\w+)/g, '{$1}'); // Convert :id to {id}
  
  // Generate summary and description
  const pathParts = path.split('/').filter(p => p);
  const resource = pathParts[pathParts.length - 1];
  const summary = `${method} ${resource}`;
  const description = `Endpoint untuk ${method.toLowerCase()} ${resource}`;

  // Determine if auth is required
  const requiresAuth = !endpoint.includes('/public/') && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register');

  // Generate parameters for path variables
  const pathParams = [];
  const pathMatches = path.match(/:(\w+)/g);
  if (pathMatches) {
    pathMatches.forEach(param => {
      const paramName = param.substring(1);
      pathParams.push(`       - in: path
         name: ${paramName}
         required: true
         schema:
           type: integer
         description: ${paramName} parameter`);
    });
  }

  // Generate request body for POST/PUT
  let requestBody = '';
  if (method === 'POST' || method === 'PUT') {
    requestBody = `     requestBody:
       required: true
       content:
         application/json:
           schema:
             type: object
             properties:
               # Add properties here
               example_field:
                 type: string
                 example: "example value"`;
  }

  // Generate security
  const security = requiresAuth ? `     security:
       - bearerAuth: []
       - cookieAuth: []` : '';

  // Generate parameters section
  const parameters = pathParams.length > 0 ? `     parameters:
${pathParams.join('\n')}` : '';

  const template = `/**
 * @swagger
 * ${pathForSwagger}:
 *   ${method.toLowerCase()}:
 *     tags: [${tag}]
 *     summary: ${summary}
 *     description: ${description}
${security}
${parameters}
${requestBody}
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   # Add response schema here
${requiresAuth ? ` *       401:
 *         $ref: '#/components/responses/Unauthorized'` : ''}
 */`;

  return template;
}

function generateTemplatesForPriority(priority) {
  const endpoints = priorityData.prioritized_endpoints[priority];
  const undocumented = endpoints.filter(endpoint => {
    const normalizedEndpoint = endpoint.replace(/\{(\w+)\}/g, '{$1}');
    return !DOCUMENTED_ENDPOINTS.some(doc => {
      const normalizedDoc = doc.replace(/\{(\w+)\}/g, '{$1}');
      return normalizedDoc === normalizedEndpoint;
    });
  });

  console.log(`\n📋 Priority ${priority} - ${undocumented.length} undocumented endpoints:`);
  
  const templates = [];
  undocumented.forEach((endpoint, index) => {
    console.log(`   ${index + 1}. ${endpoint}`);
    templates.push({
      endpoint,
      template: generateSwaggerTemplate(endpoint)
    });
  });

  return templates;
}

function main() {
  console.log('🔧 Generating Swagger Documentation Templates...\n');
  
  console.log(`📊 Current Status:`);
  console.log(`   ✅ Documented: ${DOCUMENTED_ENDPOINTS.length} endpoints`);
  console.log(`   📋 Total: ${endpointData.total_endpoints} endpoints`);
  console.log(`   📈 Coverage: ${((DOCUMENTED_ENDPOINTS.length / endpointData.total_endpoints) * 100).toFixed(1)}%`);

  // Generate templates for CRITICAL and HIGH priority
  const criticalTemplates = generateTemplatesForPriority("1");
  const highTemplates = generateTemplatesForPriority("2");
  const mediumTemplates = generateTemplatesForPriority("3");

  // Save templates to files
  const allTemplates = {
    critical: criticalTemplates,
    high: highTemplates,
    medium: mediumTemplates,
    summary: {
      critical_count: criticalTemplates.length,
      high_count: highTemplates.length,
      medium_count: mediumTemplates.length,
      total_undocumented: criticalTemplates.length + highTemplates.length + mediumTemplates.length
    }
  };

  fs.writeFileSync('./debug/swagger-templates.json', JSON.stringify(allTemplates, null, 2));
  
  // Generate a readable template file
  let templateFile = '// SWAGGER DOCUMENTATION TEMPLATES\n\n';
  templateFile += '// CRITICAL PRIORITY ENDPOINTS\n';
  criticalTemplates.forEach(t => {
    templateFile += `\n// ${t.endpoint}\n${t.template}\n`;
  });
  
  templateFile += '\n\n// HIGH PRIORITY ENDPOINTS\n';
  highTemplates.slice(0, 10).forEach(t => { // Limit to first 10 for file size
    templateFile += `\n// ${t.endpoint}\n${t.template}\n`;
  });

  fs.writeFileSync('./debug/swagger-templates.txt', templateFile);

  console.log(`\n📊 SUMMARY:`);
  console.log(`   🔥 CRITICAL undocumented: ${criticalTemplates.length}`);
  console.log(`   ⚡ HIGH undocumented: ${highTemplates.length}`);
  console.log(`   📋 MEDIUM undocumented: ${mediumTemplates.length}`);
  console.log(`   📈 Total to document: ${allTemplates.summary.total_undocumented}`);
  
  console.log(`\n💾 Files generated:`);
  console.log(`   📄 ./debug/swagger-templates.json - Full templates data`);
  console.log(`   📝 ./debug/swagger-templates.txt - Readable templates`);

  return allTemplates;
}

main();
