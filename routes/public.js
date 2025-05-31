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
