// routes/enhancedRoutes.js - Enhanced Features Documentation & API Info
const express = require('express');
const router = express.Router();

// =====================================================
// ENHANCED FEATURES DOCUMENTATION
// =====================================================

/**
 * @swagger
 * /api/enhanced/:
 *   get:
 *     tags: [Enhanced Features]
 *     summary: Get enhanced features overview ⚪ PUBLIC
 *     description: Endpoint untuk mendapatkan overview fitur-fitur enhanced sistem
 *     responses:
 *       200:
 *         description: Overview fitur enhanced berhasil diambil
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
 *                   example: "Enhanced Futsal Booking System - Advanced Features"
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "2.0.0"
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Auto-completion", "Real-time notifications", "Advanced analytics", "Role-based access"]
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     last_updated:
 *                       type: string
 *                       format: date-time
 *
 * @route   GET /api/enhanced/
 * @desc    Enhanced features overview
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Enhanced Futsal Booking System - Features Overview',
    data: {
      system_info: {
        name: 'Enhanced Futsal Booking System',
        version: '2.0.0',
        architecture: 'Domain-based with role-based access control',
        last_updated: '2024-11-30'
      },
      enhanced_features: {
        role_system: {
          description: 'Enhanced 6-role system with hierarchical access control',
          roles: [
            'pengunjung (Guest)',
            'penyewa (Customer)',
            'staff_kasir (Cashier)',
            'operator_lapangan (Field Operator)',
            'manajer_futsal (Manager)',
            'supervisor_sistem (System Supervisor)'
          ]
        },
        notifications: {
          description: 'Real-time notification system with multiple channels',
          features: ['Push notifications', 'Email notifications', 'In-app notifications']
        },
        reviews: {
          description: 'Field review and rating system',
          features: ['5-star rating', 'Written reviews', 'Photo uploads', 'Review moderation']
        },
        favorites: {
          description: 'User favorites and recommendations',
          features: ['Favorite fields', 'Smart recommendations', 'Availability tracking']
        },
        promotions: {
          description: 'Flexible promotion and discount system',
          features: ['Percentage discounts', 'Fixed amount discounts', 'Usage limits', 'Time-based promotions']
        },
        analytics: {
          description: 'Comprehensive business analytics',
          features: ['Revenue tracking', 'Booking analytics', 'User behavior', 'Performance metrics']
        },
        audit_trail: {
          description: 'Complete audit trail for all system activities',
          features: ['User actions', 'Data changes', 'System events', 'Security logs']
        }
      },
      api_endpoints: {
        public: '/api/public',
        auth: '/api/auth',
        customer: '/api/customer',
        admin: '/api/admin',
        staff: {
          kasir: '/api/staff/kasir',
          operator: '/api/staff/operator',
          manager: '/api/staff/manager',
          supervisor: '/api/staff/supervisor'
        }
      },
      documentation: {
        api_docs: '/docs',
        postman_collection: '/docs/postman',
        architecture: '/docs/architecture',
        deployment: '/docs/deployment'
      }
    }
  });
});

/**
 * @swagger
 * /api/enhanced/features:
 *   get:
 *     tags: [Enhanced Features]
 *     summary: Get detailed enhanced features ⚪ PUBLIC
 *     description: Endpoint untuk mendapatkan daftar detail fitur-fitur enhanced
 *     responses:
 *       200:
 *         description: Daftar fitur enhanced berhasil diambil
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
 *                     booking_features:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           status:
 *                             type: string
 *                       example:
 *                         - name: "Auto-completion"
 *                           description: "Automatic booking completion system"
 *                           status: "active"
 *                     notification_features:
 *                       type: array
 *                       items:
 *                         type: object
 *                     analytics_features:
 *                       type: array
 *                       items:
 *                         type: object
 *                     security_features:
 *                       type: array
 *                       items:
 *                         type: object
 *
 * @route   GET /api/enhanced/features
 * @desc    Detailed features list
 * @access  Public
 */
router.get('/features', (req, res) => {
  res.json({
    success: true,
    data: {
      core_features: [
        {
          name: 'User Management',
          description: 'Enhanced user registration and profile management',
          endpoints: ['/api/auth/register', '/api/auth/login', '/api/customer/profile']
        },
        {
          name: 'Field Management',
          description: 'Comprehensive field management with availability tracking',
          endpoints: ['/api/public/fields', '/api/staff/manager/fields']
        },
        {
          name: 'Booking System',
          description: 'Advanced booking system with conflict detection',
          endpoints: ['/api/customer/bookings', '/api/staff/operator/bookings']
        },
        {
          name: 'Payment Processing',
          description: 'Multi-method payment processing with gateway integration',
          endpoints: ['/api/staff/kasir/payments', '/api/customer/payments']
        }
      ],
      enhanced_features: [
        {
          name: 'Notification System',
          description: 'Real-time notifications with multiple delivery channels',
          endpoints: ['/api/customer/notifications', '/api/admin/notifications']
        },
        {
          name: 'Review & Rating',
          description: 'Field review system with photo uploads and moderation',
          endpoints: ['/api/customer/reviews', '/api/public/fields/:id/reviews']
        },
        {
          name: 'Favorites & Recommendations',
          description: 'User favorites with smart recommendation engine',
          endpoints: ['/api/customer/favorites', '/api/customer/recommendations']
        },
        {
          name: 'Promotion System',
          description: 'Flexible promotion and discount management',
          endpoints: ['/api/customer/promotions', '/api/admin/promotions']
        },
        {
          name: 'Analytics Dashboard',
          description: 'Comprehensive business intelligence and reporting',
          endpoints: ['/api/admin/analytics', '/api/staff/manager/analytics']
        },
        {
          name: 'Audit Trail',
          description: 'Complete audit logging for compliance and security',
          endpoints: ['/api/admin/audit-logs', '/api/staff/supervisor/audit-logs']
        }
      ],
      system_features: [
        {
          name: 'Role-Based Access Control',
          description: 'Hierarchical role system with granular permissions',
          roles: ['pengunjung', 'penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem']
        },
        {
          name: 'Auto-Generation',
          description: 'Automatic generation of booking numbers, payment numbers, and IDs',
          features: ['Booking numbers', 'Payment numbers', 'Employee IDs']
        },
        {
          name: 'Conflict Detection',
          description: 'Advanced conflict detection for bookings and scheduling',
          features: ['Double booking prevention', 'Time slot validation', 'Field availability']
        },
        {
          name: 'Data Integrity',
          description: 'Database-level constraints and triggers for data consistency',
          features: ['Foreign key constraints', 'Check constraints', 'Audit triggers']
        }
      ]
    }
  });
});

/**
 * @route   GET /api/enhanced/architecture
 * @desc    System architecture overview
 * @access  Public
 */
router.get('/architecture', (req, res) => {
  res.json({
    success: true,
    data: {
      architecture_type: 'Domain-based with role-based access control',
      folder_structure: {
        controllers: 'Role-based organization (admin, customer, staff, public, auth)',
        models: 'Domain-based organization (core, business, enhanced, system, tracking)',
        middlewares: 'Function-based organization (auth, authorization, security)',
        routes: 'Flat structure with consistent naming (authRoutes.js, customerRoutes.js, etc.)'
      },
      design_patterns: [
        'MVC (Model-View-Controller)',
        'Repository Pattern',
        'Middleware Pattern',
        'Factory Pattern',
        'Observer Pattern'
      ],
      database_design: {
        type: 'PostgreSQL with JSONB support',
        tables: 18,
        custom_types: 4,
        triggers: 'Auto-generation and audit triggers',
        constraints: 'Comprehensive data integrity constraints'
      },
      security_features: [
        'JWT Authentication',
        'Role-based authorization',
        'Rate limiting',
        'Input validation',
        'SQL injection prevention',
        'XSS protection',
        'CORS configuration'
      ]
    }
  });
});

/**
 * @route   GET /api/enhanced/status
 * @desc    System status and health check
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      system_status: 'operational',
      api_version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      features_status: {
        authentication: 'operational',
        authorization: 'operational',
        database: 'operational',
        notifications: 'operational',
        payments: 'operational',
        analytics: 'operational'
      },
      performance_metrics: {
        memory_usage: process.memoryUsage(),
        cpu_usage: process.cpuUsage()
      }
    }
  });
});

module.exports = router;
