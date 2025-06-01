// routes/indexRoutes.js - Central Route Aggregator
const express = require('express');
const router = express.Router();

// Import test routes
const testRoutes = require('./testRoutes');

// Import all route modules
const authRoutes = require('./authRoutes');
const publicRoutes = require('./publicRoutes');
const adminRoutes = require('./adminRoutes');
const customerRoutes = require('./customerRoutes');
const kasirRoutes = require('./kasirRoutes');
const operatorRoutes = require('./operatorRoutes');
const managerRoutes = require('./managerRoutes');
const supervisorRoutes = require('./supervisorRoutes');
const enhancedRoutes = require('./enhancedRoutes');

// =====================================================
// ROUTE MOUNTING - SIMPLIFIED FLAT STRUCTURE
// =====================================================

// Test routes
router.use('/test', testRoutes);

// All routes enabled
router.use('/public', publicRoutes);
router.use('/auth', authRoutes);
router.use('/customer', customerRoutes);
router.use('/admin', adminRoutes);
router.use('/staff/kasir', kasirRoutes);
router.use('/staff/operator', operatorRoutes);
router.use('/staff/manager', managerRoutes);
router.use('/staff/supervisor', supervisorRoutes);
router.use('/enhanced', enhancedRoutes);

// =====================================================
// LEGACY COMPATIBILITY ROUTES
// =====================================================

// Legacy routes (commented out for testing)
// router.use('/user', (req, res, next) => {
//   console.log('Legacy /user route accessed, redirecting to /customer');
//   req.url = req.url.replace('/user', '/customer');
//   customerRoutes(req, res, next);
// });

// router.use('/pengelola', (req, res, next) => {
//   console.log('Legacy /pengelola route accessed, redirecting to /staff/manager');
//   req.url = req.url.replace('/pengelola', '/staff/manager');
//   managerRoutes(req, res, next);
// });

// =====================================================
// HEALTH CHECK & API INFO
// =====================================================

/**
 * @route   GET /api/
 * @desc    API health check and information
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Enhanced Futsal Booking System API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    architecture: {
      type: 'Simplified flat structure with consistent naming',
      routes_structure: 'Flat files with Routes.js suffix',
      organization: 'Domain-based with role-based access control'
    },
    endpoints: {
      public: '/api/public',
      auth: '/api/auth',
      customer: '/api/customer',
      admin: '/api/admin',
      staff: {
        kasir: '/api/staff/kasir',
        operator: '/api/staff/operator',
        manager: '/api/staff/manager',
        supervisor: '/api/staff/supervisor'
      },
      enhanced: '/api/enhanced',
      legacy: {
        user: '/api/user (redirects to /api/customer)',
        pengelola: '/api/pengelola (redirects to /api/staff/manager)'
      }
    },
    features: [
      'Enhanced 6-role system',
      'Real-time notifications',
      'Field reviews & ratings',
      'User favorites & recommendations',
      'Flexible promotion system',
      'Comprehensive analytics',
      'Complete audit trail',
      'Auto-generation features',
      'Conflict detection',
      'Payment gateway integration'
    ],
    documentation: '/api/enhanced'
  });
});

/**
 * @route   GET /api/health
 * @desc    API health check
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    routes_loaded: {
      auth: 'authRoutes.js',
      public: 'publicRoutes.js',
      admin: 'adminRoutes.js',
      customer: 'customerRoutes.js',
      kasir: 'kasirRoutes.js',
      operator: 'operatorRoutes.js',
      manager: 'managerRoutes.js',
      supervisor: 'supervisorRoutes.js',
      enhanced: 'enhancedRoutes.js'
    }
  });
});

/**
 * @route   GET /api/routes
 * @desc    List all available routes
 * @access  Public
 */
router.get('/routes', (req, res) => {
  res.json({
    success: true,
    data: {
      route_structure: 'Simplified flat structure',
      naming_convention: 'Consistent Routes.js suffix',
      total_route_files: 9,
      route_files: [
        {
          file: 'authRoutes.js',
          mount_path: '/api/auth',
          description: 'Authentication and authorization routes',
          access: 'Public'
        },
        {
          file: 'publicRoutes.js',
          mount_path: '/api/public',
          description: 'Public access routes for guests',
          access: 'Public'
        },
        {
          file: 'customerRoutes.js',
          mount_path: '/api/customer',
          description: 'Customer features and booking management',
          access: 'Customer (penyewa)'
        },
        {
          file: 'adminRoutes.js',
          mount_path: '/api/admin',
          description: 'Administrative management functions',
          access: 'Management (manajer_futsal+)'
        },
        {
          file: 'kasirRoutes.js',
          mount_path: '/api/staff/kasir',
          description: 'Cashier operations and payment processing',
          access: 'Staff (staff_kasir+)'
        },
        {
          file: 'operatorRoutes.js',
          mount_path: '/api/staff/operator',
          description: 'Field operations and booking management',
          access: 'Staff (operator_lapangan+)'
        },
        {
          file: 'managerRoutes.js',
          mount_path: '/api/staff/manager',
          description: 'Business management and analytics',
          access: 'Management (manajer_futsal+)'
        },
        {
          file: 'supervisorRoutes.js',
          mount_path: '/api/staff/supervisor',
          description: 'System administration and monitoring',
          access: 'Admin (supervisor_sistem)'
        },
        {
          file: 'enhancedRoutes.js',
          mount_path: '/api/enhanced',
          description: 'Enhanced features documentation and API info',
          access: 'Public'
        }
      ],
      legacy_compatibility: [
        {
          legacy_path: '/api/user',
          redirects_to: '/api/customer',
          status: 'Active'
        },
        {
          legacy_path: '/api/pengelola',
          redirects_to: '/api/staff/manager',
          status: 'Active'
        }
      ]
    }
  });
});

module.exports = router;
