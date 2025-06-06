// routes/publicRoutes.js - Public Routes untuk Guest Access
const express = require('express');
const router = express.Router();

// Controllers
const {
  getPublicFields,
  getPublicFieldDetail,
  getPublicFieldAvailability,
  getFieldTypes,
  getFieldLocations,
  getSystemInfo
} = require('../controllers/public/publicController');

// Enhanced Features Controllers
const { getApplicationConfig } = require('../controllers/admin/systemSettingsController');
const { getFieldReviewsList, getFieldRating } = require('../controllers/customer/reviewController');
const { getAvailablePromotions, getFieldPromotions } = require('../controllers/customer/promotionController');

// Services removed - maps and weather features cancelled

// Middlewares
const { optionalAuth } = require('../middlewares/auth/authMiddleware');

// =====================================================
// PUBLIC ROUTES - GUEST ACCESS
// =====================================================

/**
 * @swagger
 * /api/public/system-info:
 *   get:
 *     tags: [Public]
 *     summary: Get informasi sistem ⚪ PUBLIC
 *     description: Endpoint untuk mendapatkan informasi sistem publik
 *     responses:
 *       200:
 *         description: Informasi sistem berhasil diambil
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
 *                   properties:
 *                     app_name:
 *                       type: string
 *                       example: "Enhanced Futsal Booking System"
 *                     version:
 *                       type: string
 *                       example: "2.0.0"
 *                     environment:
 *                       type: string
 *                       example: "production"
 *                     server_time:
 *                       type: string
 *                       format: date-time
 *                     timezone:
 *                       type: string
 *                       example: "Asia/Jakarta"
 *                     features:
 *                       type: object
 *                       properties:
 *                         role_based_access:
 *                           type: boolean
 *                           example: true
 *                         auto_completion:
 *                           type: boolean
 *                           example: true
 *                         notifications:
 *                           type: boolean
 *                           example: true
 *                         reviews:
 *                           type: boolean
 *                           example: true
 *                         promotions:
 *                           type: boolean
 *                           example: true
 *
 * @route   GET /api/public/system-info
 * @desc    Get system information
 * @access  Public
 */
router.get('/system-info', getSystemInfo);

/**
 * @swagger
 * /api/public/database-status:
 *   get:
 *     tags: [Public]
 *     summary: Get status database ⚪ PUBLIC
 *     description: Endpoint untuk mengecek status database dan tabel
 *     responses:
 *       200:
 *         description: Status database berhasil diambil
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
 *                   properties:
 *                     database_connected:
 *                       type: boolean
 *                       example: true
 *                     total_tables:
 *                       type: integer
 *                       example: 15
 *                     missing_tables:
 *                       type: array
 *                       items:
 *                         type: string
 *                     existing_tables:
 *                       type: array
 *                       items:
 *                         type: string
 *                     migration_status:
 *                       type: string
 *                       example: "completed"
 *                     last_check:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Database connection error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Database connection failed"
 *
 * @route   GET /api/public/database-status
 * @desc    Check database tables and migration status
 * @access  Public
 */
router.get('/database-status', async (req, res) => {
  try {
    const pool = require('../config/db');

    // Check all tables exist
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const tablesResult = await pool.query(tablesQuery);
    const existingTables = tablesResult.rows.map(row => row.table_name);

    // Expected tables
    const expectedTables = [
      'users', 'fields', 'bookings', 'payments', 'role_change_requests',
      'notifications', 'field_reviews', 'promotions', 'promotion_usages',
      'system_settings', 'audit_logs', 'field_availability', 'user_favorites',
      'booking_history', 'payment_logs'
    ];

    // Check which tables are missing
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));

    // Count records in main tables
    const tableCounts = {};
    for (const table of ['users', 'fields', 'bookings', 'payments']) {
      if (existingTables.includes(table)) {
        try {
          const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
          tableCounts[table] = parseInt(countResult.rows[0].count);
        } catch (err) {
          tableCounts[table] = 'Error: ' + err.message;
        }
      }
    }

    res.json({
      success: true,
      data: {
        database_status: 'connected',
        total_tables: existingTables.length,
        existing_tables: existingTables,
        missing_tables: missingTables,
        table_counts: tableCounts,
        migration_status: missingTables.length === 0 ? 'complete' : 'incomplete'
      }
    });

  } catch (error) {
    console.error('Database status error:', error);
    res.status(500).json({
      error: 'Failed to check database status',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/public/fields:
 *   get:
 *     summary: Mendapatkan daftar lapangan yang tersedia ⚪ PUBLIC
 *     description: Endpoint publik untuk mendapatkan semua lapangan futsal dengan informasi lengkap
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [futsal, mini_soccer, basketball]
 *         description: Filter berdasarkan jenis lapangan
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter berdasarkan lokasi
 *     responses:
 *       200:
 *         description: Daftar lapangan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Daftar lapangan berhasil diambil"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Field'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * @route   GET /api/public/fields
 * @desc    Get available fields untuk pengunjung
 * @access  Public
 * @query   { page, limit, search, type, location }
 */
router.get('/fields',
  optionalAuth,
  getPublicFields
);

/**
 * @swagger
 * /api/public/fields/{id}:
 *   get:
 *     tags: [Public]
 *     summary: Get detail lapangan ⚪ PUBLIC
 *     description: Endpoint untuk mendapatkan detail lengkap lapangan berdasarkan ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan
 *     responses:
 *       200:
 *         description: Detail lapangan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Field'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   GET /api/public/fields/:id
 * @desc    Get field detail untuk pengunjung
 * @access  Public
 * @params  { id: field_id }
 */
router.get('/fields/:id',
  optionalAuth,
  getPublicFieldDetail
);

/**
 * @swagger
 * /api/public/fields/{id}/availability:
 *   get:
 *     tags: [Public]
 *     summary: Cek ketersediaan lapangan ⚪ PUBLIC
 *     description: Endpoint untuk mengecek ketersediaan lapangan pada tanggal tertentu
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: '2024-12-01'
 *         description: Tanggal yang ingin dicek
 *     responses:
 *       200:
 *         description: Ketersediaan lapangan berhasil diambil
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
 *                   properties:
 *                     field_id:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: '2024-12-01'
 *                     available_slots:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           start_time:
 *                             type: string
 *                             example: '10:00'
 *                           end_time:
 *                             type: string
 *                             example: '11:00'
 *                           is_available:
 *                             type: boolean
 *                           price:
 *                             type: string
 *                             example: '150000.00'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   GET /api/public/fields/:id/availability
 * @desc    Get field availability untuk pengunjung
 * @access  Public
 * @params  { id: field_id }
 * @query   { date }
 */
router.get('/fields/:id/availability',
  optionalAuth,
  getPublicFieldAvailability
);

/**
 * @swagger
 * /api/public/field-types:
 *   get:
 *     tags: [Public]
 *     summary: Get tipe lapangan
 *     description: Endpoint untuk mendapatkan daftar tipe lapangan yang tersedia
 *     responses:
 *       200:
 *         description: Daftar tipe lapangan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Futsal Indoor"
 *                       description:
 *                         type: string
 *                         example: "Lapangan futsal indoor dengan rumput sintetis"
 *                       price_per_hour:
 *                         type: string
 *                         example: "100000.00"
 *
 * @route   GET /api/public/field-types
 * @desc    Get available field types
 * @access  Public
 */
router.get('/field-types',
  optionalAuth,
  getFieldTypes
);

/**
 * @route   GET /api/public/field-locations
 * @desc    Get available field locations
 * @access  Public
 */
router.get('/field-locations',
  optionalAuth,
  getFieldLocations
);

/**
 * @swagger
 * /api/public/health:
 *   get:
 *     tags: [Public]
 *     summary: Health check
 *     description: Endpoint untuk health check sistem
 *     responses:
 *       200:
 *         description: Sistem berjalan dengan baik
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 3600.5
 *
 * @route   GET /api/public/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @swagger
 * /api/public/version:
 *   get:
 *     tags: [Public]
 *     summary: Get versi aplikasi
 *     description: Endpoint untuk mendapatkan versi aplikasi dan informasi build
 *     responses:
 *       200:
 *         description: Informasi versi berhasil diambil
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
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "2.0.0"
 *                     build:
 *                       type: string
 *                       example: "20241206"
 *                     environment:
 *                       type: string
 *                       example: "production"
 *                     node_version:
 *                       type: string
 *                       example: "18.17.0"
 *
 * @route   GET /api/public/version
 * @desc    Get API version
 * @access  Public
 */
router.get('/version', (req, res) => {
  res.json({
    success: true,
    data: {
      api_version: '2.0.0',
      enhanced_role_system: true,
      last_updated: '2024-11-30',
      features: [
        'role_based_access',
        'auto_generation',
        'conflict_detection',
        'payment_gateway_ready',
        'audit_trail',
        'jsonb_support'
      ]
    }
  });
});

// =====================================================
// ENHANCED FEATURES - PUBLIC ACCESS
// =====================================================

/**
 * @route   GET /api/public/app-config
 * @desc    Get application configuration
 * @access  Public
 */
router.get('/app-config', getApplicationConfig);

/**
 * @swagger
 * /api/public/fields/{fieldId}/reviews:
 *   get:
 *     tags: [Public]
 *     summary: Get review lapangan
 *     description: Endpoint untuk mendapatkan daftar review lapangan dari customer
 *     parameters:
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman
 *     responses:
 *       200:
 *         description: Daftar review berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_name:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   GET /api/public/fields/:fieldId/reviews
 * @desc    Get field reviews (public view)
 * @access  Public
 * @params  { fieldId: field_id }
 * @query   { page, limit }
 */
router.get('/fields/:fieldId/reviews',
  optionalAuth,
  getFieldReviewsList
);

/**
 * @swagger
 * /api/public/fields/{fieldId}/rating:
 *   get:
 *     tags: [Public]
 *     summary: Get rating lapangan
 *     description: Endpoint untuk mendapatkan ringkasan rating lapangan
 *     parameters:
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan
 *     responses:
 *       200:
 *         description: Rating lapangan berhasil diambil
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
 *                   properties:
 *                     field_id:
 *                       type: integer
 *                       example: 1
 *                     average_rating:
 *                       type: string
 *                       example: "4.5"
 *                     total_reviews:
 *                       type: integer
 *                       example: 25
 *                     rating_distribution:
 *                       type: object
 *                       properties:
 *                         "5":
 *                           type: integer
 *                           example: 15
 *                         "4":
 *                           type: integer
 *                           example: 8
 *                         "3":
 *                           type: integer
 *                           example: 2
 *                         "2":
 *                           type: integer
 *                           example: 0
 *                         "1":
 *                           type: integer
 *                           example: 0
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   GET /api/public/fields/:fieldId/rating
 * @desc    Get field rating summary
 * @access  Public
 * @params  { fieldId: field_id }
 */
router.get('/fields/:fieldId/rating',
  optionalAuth,
  getFieldRating
);

/**
 * @swagger
 * /api/public/promotions:
 *   get:
 *     tags: [Public]
 *     summary: Get promosi yang tersedia
 *     description: Endpoint untuk mendapatkan daftar promosi yang sedang aktif
 *     responses:
 *       200:
 *         description: Daftar promosi berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Diskon Weekend"
 *                       description:
 *                         type: string
 *                         example: "Diskon 20% untuk booking weekend"
 *                       code:
 *                         type: string
 *                         example: "WEEKEND20"
 *                       type:
 *                         type: string
 *                         enum: [percentage, fixed]
 *                         example: "percentage"
 *                       value:
 *                         type: string
 *                         example: "20.00"
 *                       valid_from:
 *                         type: string
 *                         format: date-time
 *                       valid_until:
 *                         type: string
 *                         format: date-time
 *
 * @route   GET /api/public/promotions
 * @desc    Get available promotions
 * @access  Public
 */
router.get('/promotions',
  optionalAuth,
  getAvailablePromotions
);

/**
 * @swagger
 * /api/public/fields/{fieldId}/promotions:
 *   get:
 *     tags: [Public]
 *     summary: Get promosi untuk lapangan tertentu
 *     description: Endpoint untuk mendapatkan promosi yang berlaku untuk lapangan tertentu
 *     parameters:
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID lapangan
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: '2024-12-01'
 *         description: Tanggal booking
 *       - in: query
 *         name: start_time
 *         schema:
 *           type: string
 *           example: '10:00'
 *         description: Waktu mulai booking
 *     responses:
 *       200:
 *         description: Promosi lapangan berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       type:
 *                         type: string
 *                       value:
 *                         type: string
 *                       applicable_fields:
 *                         type: array
 *                         items:
 *                           type: integer
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * @route   GET /api/public/fields/:fieldId/promotions
 * @desc    Get promotions applicable for specific field
 * @access  Public
 * @params  { fieldId: field_id }
 * @query   { date, start_time }
 */
router.get('/fields/:fieldId/promotions',
  optionalAuth,
  getFieldPromotions
);

// Debug endpoint for table structure
router.get('/debug/table/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const pool = require('../config/db');

    // Get table structure
    const structureQuery = `
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    const structureResult = await pool.query(structureQuery, [tableName]);

    // Check if table exists
    if (structureResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Table '${tableName}' not found`
      });
    }

    res.json({
      success: true,
      data: {
        table_name: tableName,
        columns: structureResult.rows
      }
    });

  } catch (error) {
    console.error('Table structure error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get table structure',
      error: error.message
    });
  }
});

// Test system settings insert
router.get('/debug/test-settings', async (req, res) => {
  try {
    const pool = require('../config/db');

    // Test with simple JSON format
    const testQuery = `
      INSERT INTO system_settings (key, value, description, is_public)
      VALUES ('debug_test', '"debug_value"', 'Debug test setting', false)
      RETURNING *
    `;

    const result = await pool.query(testQuery);

    res.json({
      success: true,
      message: 'System settings insert test successful',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('System settings test error:', error);
    res.status(500).json({
      success: false,
      message: 'System settings test failed',
      error: error.message
    });
  }
});

// Test promotion insert
router.get('/debug/test-promotion', async (req, res) => {
  try {
    const pool = require('../config/db');

    // Include all required columns including start_date_old and end_date_old
    const testQuery = `
      INSERT INTO promotions (
        name, description, code, type, value, min_booking_amount,
        valid_from, valid_until, applicable_fields, applicable_days,
        is_active, created_by, start_date_old, end_date_old
      )
      VALUES (
        'Debug Test', 'Debug test promotion', 'DEBUGTEST', 'percentage', 10, 0,
        '2025-06-01', '2025-12-31', '[]', '[]',
        true, 1, '2025-06-01', '2025-12-31'
      )
      RETURNING *
    `;

    const result = await pool.query(testQuery);

    res.json({
      success: true,
      message: 'Promotion insert test successful',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Promotion test error:', error);
    res.status(500).json({
      success: false,
      message: 'Promotion test failed',
      error: error.message
    });
  }
});

module.exports = router;
