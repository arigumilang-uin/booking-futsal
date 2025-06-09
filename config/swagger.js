// config/swagger.js - Konfigurasi Swagger/OpenAPI Documentation
const swaggerUi = require('swagger-ui-express');

// Import dokumentasi Swagger yang sudah dipisahkan
const swaggerDefinition = require('../docs/swagger/index');

/**
 * Tidak perlu lagi menggunakan swagger-jsdoc karena dokumentasi sudah terpisah
 * Langsung gunakan definisi yang sudah lengkap
 */
const specs = swaggerDefinition;

/**
 * Konfigurasi Swagger UI
 */
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none'
  },
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .scheme-container { margin: 20px 0; }
    .swagger-ui .info .title { color: #2c3e50; }
    .swagger-ui .info .description { color: #34495e; }
  `,
  customSiteTitle: 'Panam Soccer Field - API Documentation'
};

module.exports = {
  specs,
  swaggerUi,
  swaggerUiOptions
};
