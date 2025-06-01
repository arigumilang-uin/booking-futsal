// routes/public.js - Public Routes untuk Guest Access
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

// Middlewares
const { optionalAuth } = require('../middlewares/auth/authMiddleware');
const { allowGuest } = require('../middlewares/roleCheck/roleMiddleware');

// =====================================================
// PUBLIC ROUTES - GUEST ACCESS
// =====================================================

/**
 * @route   GET /api/public/system-info
 * @desc    Get system information
 * @access  Public
 */
router.get('/system-info', getSystemInfo);

/**
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
 * @route   GET /api/public/fields
 * @desc    Get available fields untuk pengunjung
 * @access  Public
 * @query   { page, limit, search, type, location }
 */
router.get('/fields', 
  optionalAuth,
  allowGuest,
  getPublicFields
);

/**
 * @route   GET /api/public/fields/:id
 * @desc    Get field detail untuk pengunjung
 * @access  Public
 * @params  { id: field_id }
 */
router.get('/fields/:id', 
  optionalAuth,
  allowGuest,
  getPublicFieldDetail
);

/**
 * @route   GET /api/public/fields/:id/availability
 * @desc    Get field availability untuk pengunjung
 * @access  Public
 * @params  { id: field_id }
 * @query   { date }
 */
router.get('/fields/:id/availability', 
  optionalAuth,
  allowGuest,
  getPublicFieldAvailability
);

/**
 * @route   GET /api/public/field-types
 * @desc    Get available field types
 * @access  Public
 */
router.get('/field-types', 
  optionalAuth,
  allowGuest,
  getFieldTypes
);

/**
 * @route   GET /api/public/field-locations
 * @desc    Get available field locations
 * @access  Public
 */
router.get('/field-locations', 
  optionalAuth,
  allowGuest,
  getFieldLocations
);

/**
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

module.exports = router;
