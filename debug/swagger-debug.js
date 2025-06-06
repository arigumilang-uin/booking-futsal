// debug/swagger-debug.js - Debug Swagger Configuration
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

// Konfigurasi swagger yang sama dengan config/swagger.js
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Enhanced Futsal Booking System API',
      version: '2.0.0',
      description: 'API untuk sistem booking lapangan futsal dengan fitur lengkap'
    },
    servers: [
      {
        url: 'https://booking-futsal-production.up.railway.app',
        description: 'Production Server (Railway)'
      },
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ]
  },
  apis: [
    './routes/authRoutes.js',
    './routes/publicRoutes.js', 
    './routes/customerRoutes.js',
    './routes/kasirRoutes.js',
    './routes/operatorRoutes.js',
    './routes/manajerRoutes.js',
    './routes/supervisorRoutes.js',
    './routes/adminRoutes.js',
    './routes/*.js'
  ]
};

async function debugSwagger() {
  console.log('🔍 Debugging Swagger Configuration...\n');

  // 1. Check if files exist
  console.log('1️⃣ Checking if route files exist:');
  const routeFiles = [
    './routes/authRoutes.js',
    './routes/publicRoutes.js', 
    './routes/customerRoutes.js',
    './routes/kasirRoutes.js',
    './routes/operatorRoutes.js'
  ];

  for (const file of routeFiles) {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    
    if (exists) {
      const content = fs.readFileSync(file, 'utf8');
      const swaggerCount = (content.match(/@swagger/g) || []).length;
      console.log(`      📝 @swagger comments: ${swaggerCount}`);
    }
  }

  // 2. Generate swagger specs
  console.log('\n2️⃣ Generating Swagger specs...');
  try {
    const specs = swaggerJsdoc(swaggerOptions);
    
    console.log(`   ✅ Swagger specs generated successfully`);
    console.log(`   📊 Total paths: ${Object.keys(specs.paths || {}).length}`);
    console.log(`   🏷️ Available tags: ${(specs.tags || []).map(t => t.name).join(', ')}`);
    
    // List all paths
    console.log('\n3️⃣ Available endpoints:');
    if (specs.paths) {
      Object.keys(specs.paths).forEach(path => {
        const methods = Object.keys(specs.paths[path]);
        console.log(`   📍 ${path}`);
        methods.forEach(method => {
          const endpoint = specs.paths[path][method];
          console.log(`      ${method.toUpperCase()}: ${endpoint.summary || 'No summary'}`);
        });
      });
    } else {
      console.log('   ❌ No paths found in swagger specs');
    }

    // 4. Save debug output
    console.log('\n4️⃣ Saving debug output...');
    fs.writeFileSync('./debug/swagger-specs.json', JSON.stringify(specs, null, 2));
    console.log('   ✅ Debug output saved to ./debug/swagger-specs.json');

  } catch (error) {
    console.error('   ❌ Error generating swagger specs:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Run debug
debugSwagger().catch(console.error);
