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

router.get('/system-info', getSystemInfo);

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

router.get('/fields',
  optionalAuth,
  getPublicFields
);

router.get('/fields/:id',
  optionalAuth,
  getPublicFieldDetail
);

router.get('/fields/:id/availability',
  optionalAuth,
  getPublicFieldAvailability
);

router.get('/field-types',
  optionalAuth,
  getFieldTypes
);

router.get('/field-locations',
  optionalAuth,
  getFieldLocations
);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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

router.get('/fields/:fieldId/reviews',
  optionalAuth,
  getFieldReviewsList
);

router.get('/fields/:fieldId/rating',
  optionalAuth,
  getFieldRating
);

router.get('/promotions',
  optionalAuth,
  getAvailablePromotions
);

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
