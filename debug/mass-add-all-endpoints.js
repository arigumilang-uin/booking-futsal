// debug/mass-add-all-endpoints.js - Mass Add ALL Missing Swagger Documentation
const fs = require('fs');

// Template untuk dokumentasi Swagger yang lebih lengkap
function generateSwaggerDoc(method, path, summary, description, tags = 'Admin', requiresAuth = true, requestBody = null, parameters = null) {
  const pathForSwagger = path.replace(/:(\w+)/g, '{$1}');
  
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

  // Add custom parameters
  if (parameters) {
    parameters.forEach(param => {
      pathParams.push(`       - in: query
         name: ${param.name}
         schema:
           type: ${param.type}
           ${param.default ? `default: ${param.default}` : ''}
         description: ${param.description}`);
    });
  }

  // Generate security
  const security = requiresAuth ? `     security:
       - bearerAuth: []
       - cookieAuth: []` : '';

  // Generate parameters section
  const parametersSection = pathParams.length > 0 ? `     parameters:
${pathParams.join('\n')}` : '';

  // Generate request body
  const requestBodySection = requestBody ? `     requestBody:
       required: true
       content:
         application/json:
           schema:
             type: object
             properties:
               ${requestBody}` : '';

  return `/**
 * @swagger
 * ${pathForSwagger}:
 *   ${method.toLowerCase()}:
 *     tags: [${tags}]
 *     summary: ${summary}
 *     description: ${description}
${security}
${parametersSection}
${requestBodySection}
 *     responses:
 *       ${method === 'POST' ? '201' : '200'}:
 *         description: ${method === 'POST' ? 'Created successfully' : 'Success response'}
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
${requiresAuth ? ` *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'` : ''}
 */`;
}

// SEMUA endpoint yang perlu didokumentasikan
const allMissingEndpoints = [
  // ADMIN ENDPOINTS
  { method: 'GET', path: '/api/admin/audit-logs', summary: 'Get semua audit logs', description: 'Endpoint untuk mendapatkan semua log audit sistem', tags: 'Admin' },
  { method: 'GET', path: '/api/admin/audit-logs/statistics', summary: 'Get statistik audit logs', description: 'Endpoint untuk mendapatkan statistik audit logs', tags: 'Admin' },
  { method: 'GET', path: '/api/admin/audit-logs/:id', summary: 'Get detail audit log', description: 'Endpoint untuk mendapatkan detail audit log berdasarkan ID', tags: 'Admin' },
  { method: 'DELETE', path: '/api/admin/audit-logs/cleanup', summary: 'Cleanup audit logs lama', description: 'Endpoint untuk membersihkan audit logs yang sudah lama', tags: 'Admin' },
  
  { method: 'POST', path: '/api/admin/notifications/broadcast', summary: 'Broadcast notifikasi', description: 'Endpoint untuk broadcast notifikasi ke multiple users', tags: 'Admin', requestBody: 'title:\n                 type: string\n               message:\n                 type: string\n               user_ids:\n                 type: array' },
  { method: 'GET', path: '/api/admin/notifications/statistics', summary: 'Get statistik notifikasi', description: 'Endpoint untuk mendapatkan statistik notifikasi', tags: 'Admin' },
  { method: 'DELETE', path: '/api/admin/notifications/:id', summary: 'Hapus notifikasi', description: 'Endpoint untuk menghapus notifikasi', tags: 'Admin' },
  
  { method: 'PUT', path: '/api/admin/promotions/:id', summary: 'Update promosi', description: 'Endpoint untuk mengupdate promosi', tags: 'Admin', requestBody: 'name:\n                 type: string\n               value:\n                 type: string' },
  { method: 'DELETE', path: '/api/admin/promotions/:id', summary: 'Hapus promosi', description: 'Endpoint untuk menghapus promosi', tags: 'Admin' },
  { method: 'GET', path: '/api/admin/promotions/:id/usage', summary: 'Get usage promosi', description: 'Endpoint untuk mendapatkan history penggunaan promosi', tags: 'Admin' },
  { method: 'GET', path: '/api/admin/promotions/analytics', summary: 'Get analytics promosi', description: 'Endpoint untuk mendapatkan analytics promosi', tags: 'Admin' },
  
  { method: 'GET', path: '/api/admin/users/:id', summary: 'Get detail user', description: 'Endpoint untuk mendapatkan detail user berdasarkan ID', tags: 'Admin' },
  { method: 'PUT', path: '/api/admin/users/:id', summary: 'Update user', description: 'Endpoint untuk mengupdate data user', tags: 'Admin', requestBody: 'name:\n                 type: string\n               email:\n                 type: string\n               role:\n                 type: string' },
  { method: 'DELETE', path: '/api/admin/users/:id', summary: 'Deactivate user', description: 'Endpoint untuk menonaktifkan user (soft delete)', tags: 'Admin' },
  
  { method: 'GET', path: '/api/admin/analytics/business', summary: 'Get business analytics', description: 'Endpoint untuk mendapatkan analytics bisnis', tags: 'Admin' },
  { method: 'GET', path: '/api/admin/analytics/system', summary: 'Get system analytics', description: 'Endpoint untuk mendapatkan analytics sistem', tags: 'Admin' },
  { method: 'GET', path: '/api/admin/analytics/performance', summary: 'Get performance metrics', description: 'Endpoint untuk mendapatkan metrics performa sistem', tags: 'Admin' },
  
  // STAFF KASIR ENDPOINTS
  { method: 'GET', path: '/api/staff/kasir/payments/:id', summary: 'Get detail pembayaran', description: 'Endpoint untuk mendapatkan detail pembayaran berdasarkan ID', tags: 'Staff' },
  { method: 'GET', path: '/api/staff/kasir/statistics', summary: 'Get statistik pembayaran', description: 'Endpoint untuk mendapatkan statistik pembayaran kasir', tags: 'Staff' },
  { method: 'GET', path: '/api/staff/kasir/daily-report', summary: 'Get laporan harian', description: 'Endpoint untuk mendapatkan laporan harian kasir', tags: 'Staff' },
  { method: 'GET', path: '/api/staff/kasir/bookings', summary: 'Get booking untuk kasir', description: 'Endpoint untuk mendapatkan daftar booking untuk kasir', tags: 'Staff' },
  { method: 'GET', path: '/api/staff/kasir/bookings/:id', summary: 'Get detail booking kasir', description: 'Endpoint untuk mendapatkan detail booking untuk kasir', tags: 'Staff' },
  
  // STAFF OPERATOR ENDPOINTS
  { method: 'GET', path: '/api/staff/operator/bookings/:id', summary: 'Get detail booking operator', description: 'Endpoint untuk mendapatkan detail booking untuk operator', tags: 'Staff' },
  { method: 'PUT', path: '/api/staff/operator/bookings/:id/complete', summary: 'Complete booking', description: 'Endpoint untuk menyelesaikan booking', tags: 'Staff' },
  { method: 'GET', path: '/api/staff/operator/bookings/pending', summary: 'Get booking pending', description: 'Endpoint untuk mendapatkan booking yang pending', tags: 'Staff' },
  { method: 'GET', path: '/api/staff/operator/fields/:field_id/bookings', summary: 'Get booking per lapangan', description: 'Endpoint untuk mendapatkan booking berdasarkan lapangan', tags: 'Staff' },
  { method: 'PUT', path: '/api/staff/operator/fields/:id/status', summary: 'Update status lapangan', description: 'Endpoint untuk mengupdate status lapangan', tags: 'Staff' },
  { method: 'GET', path: '/api/staff/operator/schedule/today', summary: 'Get jadwal hari ini', description: 'Endpoint untuk mendapatkan jadwal operator hari ini', tags: 'Staff' },
  { method: 'GET', path: '/api/staff/operator/schedule/:date', summary: 'Get jadwal berdasarkan tanggal', description: 'Endpoint untuk mendapatkan jadwal operator berdasarkan tanggal', tags: 'Staff' },
  { method: 'GET', path: '/api/staff/operator/statistics', summary: 'Get statistik operator', description: 'Endpoint untuk mendapatkan statistik operator', tags: 'Staff' },
  
  // CUSTOMER ADDITIONAL ENDPOINTS
  { method: 'GET', path: '/api/customer/booking-history', summary: 'Get riwayat booking lengkap', description: 'Endpoint untuk mendapatkan riwayat booking lengkap customer', tags: 'Customer' },
  { method: 'GET', path: '/api/customer/upcoming-bookings', summary: 'Get booking mendatang', description: 'Endpoint untuk mendapatkan booking yang akan datang', tags: 'Customer' },
  { method: 'GET', path: '/api/customer/fields', summary: 'Get lapangan untuk customer', description: 'Endpoint untuk mendapatkan daftar lapangan untuk customer', tags: 'Customer' },
  { method: 'PUT', path: '/api/customer/notifications/read-all', summary: 'Tandai semua notifikasi dibaca', description: 'Endpoint untuk menandai semua notifikasi sebagai dibaca', tags: 'Customer' },
  { method: 'DELETE', path: '/api/customer/notifications/:id', summary: 'Hapus notifikasi', description: 'Endpoint untuk menghapus notifikasi customer', tags: 'Customer' },
  { method: 'GET', path: '/api/customer/notifications/statistics', summary: 'Get statistik notifikasi', description: 'Endpoint untuk mendapatkan statistik notifikasi customer', tags: 'Customer' },
  
  // PUBLIC ADDITIONAL ENDPOINTS
  { method: 'GET', path: '/api/public/system-info', summary: 'Get informasi sistem', description: 'Endpoint untuk mendapatkan informasi sistem publik', tags: 'Public', requiresAuth: false },
  { method: 'GET', path: '/api/public/database-status', summary: 'Get status database', description: 'Endpoint untuk mengecek status database', tags: 'Public', requiresAuth: false },
  { method: 'GET', path: '/api/public/health', summary: 'Health check', description: 'Endpoint untuk health check sistem', tags: 'Public', requiresAuth: false },
  { method: 'GET', path: '/api/public/version', summary: 'Get versi aplikasi', description: 'Endpoint untuk mendapatkan versi aplikasi', tags: 'Public', requiresAuth: false },
  { method: 'GET', path: '/api/public/field-types', summary: 'Get tipe lapangan', description: 'Endpoint untuk mendapatkan daftar tipe lapangan', tags: 'Public', requiresAuth: false },
  { method: 'GET', path: '/api/public/field-locations', summary: 'Get lokasi lapangan', description: 'Endpoint untuk mendapatkan daftar lokasi lapangan', tags: 'Public', requiresAuth: false }
];

// Generate dokumentasi untuk semua endpoint
function generateAllDocs() {
  console.log('🚀 Generating MASSIVE Swagger Documentation...\n');
  
  let allDocs = '';
  allMissingEndpoints.forEach((endpoint, index) => {
    const doc = generateSwaggerDoc(
      endpoint.method,
      endpoint.path,
      endpoint.summary,
      endpoint.description,
      endpoint.tags,
      endpoint.requiresAuth !== false,
      endpoint.requestBody,
      endpoint.parameters
    );
    
    allDocs += `\n// ${index + 1}. ${endpoint.method} ${endpoint.path}\n${doc}\n`;
  });
  
  // Save to file
  fs.writeFileSync('./debug/massive-swagger-docs.txt', allDocs);
  
  console.log(`✅ Generated documentation for ${allMissingEndpoints.length} endpoints`);
  console.log('📄 Saved to ./debug/massive-swagger-docs.txt');
  console.log('\n📋 Generated endpoints by category:');
  
  const categories = {};
  allMissingEndpoints.forEach(endpoint => {
    if (!categories[endpoint.tags]) categories[endpoint.tags] = [];
    categories[endpoint.tags].push(`${endpoint.method} ${endpoint.path}`);
  });
  
  Object.keys(categories).forEach(category => {
    console.log(`\n🏷️  ${category} (${categories[category].length} endpoints):`);
    categories[category].forEach((endpoint, index) => {
      console.log(`   ${index + 1}. ${endpoint}`);
    });
  });
  
  return allDocs;
}

// Run generation
generateAllDocs();
