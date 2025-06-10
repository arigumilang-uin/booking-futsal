/**
 * Panam Soccer Field - Main Swagger Documentation Index
 * File utama untuk menggabungkan semua dokumentasi API
 */

// Import komponen
const schemas = require('./components/schemas');
const responses = require('./components/responses');
const parameters = require('./components/parameters');

// Import path definitions
const authPaths = require('./paths/auth');
const customerPaths = require('./paths/customer');
const adminPaths = require('./paths/admin');
const adminAuditPaths = require('./paths/admin-audit');
const adminNotificationPaths = require('./paths/admin-notifications');
const staffPaths = require('./paths/staff');
const publicPaths = require('./paths/public');
const paymentPaths = require('./paths/payment');
const analyticsPaths = require('./paths/analytics');
const auditPaths = require('./paths/audit');

/**
 * Konfigurasi lengkap Swagger untuk Panam Soccer Field
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Panam Soccer Field - Booking Management API',
    version: '2.0.0',
    description: `
      API untuk sistem manajemen booking lapangan futsal Panam Soccer Field dengan fitur lengkap:
      - Sistem autentikasi dan otorisasi berbasis role (6-level hierarchy)
      - Manajemen booking lapangan dengan deteksi konflik real-time
      - Sistem pembayaran multi-metode dengan tracking otomatis
      - Notifikasi real-time dan audit trail komprehensif
      - Analytics dan reporting untuk business intelligence
      - Auto-completion booking dengan cron jobs
      - Enhanced features: reviews, favorites, promotions
      
      **Panam Soccer Field Role Hierarchy:**
      1. pengunjung (Guest) - Akses publik informasi lapangan
      2. penyewa (Customer) - Booking dan pembayaran lapangan
      3. staff_kasir (Cashier) - Proses pembayaran dan konfirmasi
      4. operator_lapangan (Field Operator) - Manajemen lapangan dan operasional
      5. manajer_futsal (Manager) - Analytics bisnis dan manajemen staff
      6. supervisor_sistem (System Supervisor) - Akses penuh sistem dan administrasi
    `,
    contact: {
      name: 'Panam Soccer Field Management',
      email: 'admin@panamsoccerfield.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://booking-futsal-production.up.railway.app',
      description: 'Production Server (Railway) - Panam Soccer Field'
    },
    {
      url: 'http://localhost:5000',
      description: 'Development Server - Local Environment'
    }
  ],
  // Frontend URL for CORS reference
  'x-frontend-url': 'https://booking-futsal-frontend.vercel.app',
  // CORS Configuration
  'x-cors-config': {
    origin: 'https://booking-futsal-frontend.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token untuk autentikasi API'
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT token dalam cookie untuk web authentication'
      }
    },
    schemas: schemas,
    responses: responses,
    parameters: parameters
  },
  paths: {
    // Gabungkan semua path definitions
    ...authPaths,
    ...customerPaths,
    ...adminPaths,
    ...adminAuditPaths,
    ...adminNotificationPaths,
    ...staffPaths,
    ...publicPaths,
    ...paymentPaths,
    ...analyticsPaths,
    ...auditPaths
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoint untuk autentikasi dan manajemen akun di Panam Soccer Field'
    },
    {
      name: 'Public',
      description: 'Endpoint publik yang dapat diakses tanpa autentikasi'
    },
    {
      name: 'Customer',
      description: 'Endpoint untuk customer (penyewa) - Level 2'
    },
    {
      name: 'Staff Kasir',
      description: 'Endpoint untuk staff kasir - Level 3'
    },
    {
      name: 'Staff Operator',
      description: 'Endpoint untuk staff operator lapangan - Level 4'
    },
    {
      name: 'Staff Manager',
      description: 'Endpoint untuk staff manager futsal - Level 5'
    },
    {
      name: 'Staff Supervisor',
      description: 'Endpoint untuk staff supervisor sistem - Level 6'
    },
    {
      name: 'Admin',
      description: 'Endpoint untuk administrator sistem - Mixed Levels (Management + Supervisor)'
    },
    {
      name: 'Admin - System Settings',
      description: 'Endpoint untuk manajemen pengaturan sistem - Supervisor Only'
    },
    {
      name: 'Admin - Audit System',
      description: 'Endpoint untuk audit logs dan monitoring sistem - Supervisor Only'
    },
    {
      name: 'Admin - Notification Management',
      description: 'Endpoint untuk manajemen notifikasi sistem - Management Level'
    },
    {
      name: 'Customer - Payment',
      description: 'Endpoint untuk manajemen pembayaran customer - Level 2'
    },
    {
      name: 'Analytics',
      description: 'Endpoint untuk analytics dan reporting - Management Level+'
    },
    {
      name: 'Audit & System',
      description: 'Endpoint untuk audit logs dan system monitoring - Supervisor Only'
    },
    {
      name: 'Enhanced Features',
      description: 'Fitur tambahan: notifikasi, review, favorit, promosi'
    }
  ],
  externalDocs: {
    description: 'Dokumentasi lengkap Panam Soccer Field',
    url: 'https://booking-futsal-production.up.railway.app/api-docs'
  }
};

module.exports = swaggerDefinition;
