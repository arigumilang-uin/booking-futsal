// debug/mass-add-swagger.js - Mass Add Swagger Documentation
const fs = require('fs');

// Template untuk dokumentasi Swagger
function generateSwaggerDoc(method, path, summary, description, tags = 'Admin', requiresAuth = true, requestBody = null) {
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

  // Generate security
  const security = requiresAuth ? `     security:
       - bearerAuth: []
       - cookieAuth: []` : '';

  // Generate parameters section
  const parameters = pathParams.length > 0 ? `     parameters:
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
${parameters}
${requestBodySection}
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
${requiresAuth ? ` *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'` : ''}
 */`;
}

// Endpoint admin yang perlu didokumentasikan
const adminEndpoints = [
  { method: 'GET', path: '/api/admin/settings', summary: 'Get semua system settings', description: 'Endpoint untuk mendapatkan semua pengaturan sistem' },
  { method: 'GET', path: '/api/admin/settings/public', summary: 'Get public system settings', description: 'Endpoint untuk mendapatkan pengaturan sistem yang bersifat publik' },
  { method: 'GET', path: '/api/admin/settings/:key', summary: 'Get setting berdasarkan key', description: 'Endpoint untuk mendapatkan pengaturan berdasarkan key tertentu' },
  { method: 'PUT', path: '/api/admin/settings/:key', summary: 'Update system setting', description: 'Endpoint untuk mengupdate pengaturan sistem', requestBody: 'value:\n                 type: string\n               description:\n                 type: string' },
  { method: 'POST', path: '/api/admin/settings', summary: 'Buat system setting baru', description: 'Endpoint untuk membuat pengaturan sistem baru', requestBody: 'key:\n                 type: string\n               value:\n                 type: string' },
  { method: 'DELETE', path: '/api/admin/settings/:key', summary: 'Hapus system setting', description: 'Endpoint untuk menghapus pengaturan sistem' },
  
  { method: 'GET', path: '/api/admin/audit-logs', summary: 'Get semua audit logs', description: 'Endpoint untuk mendapatkan semua log audit sistem' },
  { method: 'GET', path: '/api/admin/audit-logs/statistics', summary: 'Get statistik audit logs', description: 'Endpoint untuk mendapatkan statistik audit logs' },
  { method: 'GET', path: '/api/admin/audit-logs/:id', summary: 'Get detail audit log', description: 'Endpoint untuk mendapatkan detail audit log berdasarkan ID' },
  
  { method: 'GET', path: '/api/admin/notifications', summary: 'Get semua notifikasi', description: 'Endpoint untuk mendapatkan semua notifikasi sistem' },
  { method: 'POST', path: '/api/admin/notifications', summary: 'Buat notifikasi sistem', description: 'Endpoint untuk membuat notifikasi sistem baru', requestBody: 'title:\n                 type: string\n               message:\n                 type: string' },
  { method: 'POST', path: '/api/admin/notifications/broadcast', summary: 'Broadcast notifikasi', description: 'Endpoint untuk broadcast notifikasi ke multiple users', requestBody: 'title:\n                 type: string\n               message:\n                 type: string\n               user_ids:\n                 type: array' },
  
  { method: 'GET', path: '/api/admin/promotions', summary: 'Get semua promosi', description: 'Endpoint untuk mendapatkan semua promosi' },
  { method: 'POST', path: '/api/admin/promotions', summary: 'Buat promosi baru', description: 'Endpoint untuk membuat promosi baru', requestBody: 'name:\n                 type: string\n               code:\n                 type: string\n               type:\n                 type: string\n               value:\n                 type: string' },
  { method: 'PUT', path: '/api/admin/promotions/:id', summary: 'Update promosi', description: 'Endpoint untuk mengupdate promosi', requestBody: 'name:\n                 type: string\n               value:\n                 type: string' },
  { method: 'DELETE', path: '/api/admin/promotions/:id', summary: 'Hapus promosi', description: 'Endpoint untuk menghapus promosi' },
  
  { method: 'GET', path: '/api/admin/users', summary: 'Get semua users', description: 'Endpoint untuk mendapatkan semua users untuk management' },
  { method: 'GET', path: '/api/admin/users/:id', summary: 'Get detail user', description: 'Endpoint untuk mendapatkan detail user berdasarkan ID' },
  { method: 'PUT', path: '/api/admin/users/:id', summary: 'Update user', description: 'Endpoint untuk mengupdate data user', requestBody: 'name:\n                 type: string\n               email:\n                 type: string\n               role:\n                 type: string' },
  { method: 'DELETE', path: '/api/admin/users/:id', summary: 'Deactivate user', description: 'Endpoint untuk menonaktifkan user (soft delete)' },
  
  { method: 'GET', path: '/api/admin/analytics/business', summary: 'Get business analytics', description: 'Endpoint untuk mendapatkan analytics bisnis' },
  { method: 'GET', path: '/api/admin/analytics/system', summary: 'Get system analytics', description: 'Endpoint untuk mendapatkan analytics sistem' },
  { method: 'GET', path: '/api/admin/analytics/performance', summary: 'Get performance metrics', description: 'Endpoint untuk mendapatkan metrics performa sistem' }
];

// Generate dokumentasi untuk semua endpoint
function generateAllDocs() {
  console.log('🔧 Generating Mass Swagger Documentation...\n');
  
  let allDocs = '';
  adminEndpoints.forEach((endpoint, index) => {
    const doc = generateSwaggerDoc(
      endpoint.method,
      endpoint.path,
      endpoint.summary,
      endpoint.description,
      'Admin',
      true,
      endpoint.requestBody
    );
    
    allDocs += `\n// ${index + 1}. ${endpoint.method} ${endpoint.path}\n${doc}\n`;
  });
  
  // Save to file
  fs.writeFileSync('./debug/mass-swagger-docs.txt', allDocs);
  
  console.log(`✅ Generated documentation for ${adminEndpoints.length} endpoints`);
  console.log('📄 Saved to ./debug/mass-swagger-docs.txt');
  console.log('\n📋 Generated endpoints:');
  
  adminEndpoints.forEach((endpoint, index) => {
    console.log(`   ${index + 1}. ${endpoint.method} ${endpoint.path} - ${endpoint.summary}`);
  });
  
  return allDocs;
}

// Run generation
generateAllDocs();
