const express = require('express');
const router = express.Router();

const authRoutes = require('../auth');
const publicRoutes = require('../public');
const customerRoutes = require('../customer');
const kasirRoutes = require('../staff/kasir');
const operatorRoutes = require('../staff/operator');
const managerRoutes = require('../staff/manager');
const supervisorRoutes = require('../staff/supervisor');
const roleManagementRoutes = require('../admin/roleManagement');

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/customer', customerRoutes);
router.use('/staff/kasir', kasirRoutes);
router.use('/staff/operator', operatorRoutes);
router.use('/staff/manager', managerRoutes);
router.use('/staff/supervisor', supervisorRoutes);
router.use('/admin/role-management', roleManagementRoutes);

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Enhanced Futsal Booking API v2.0',
    version: '2.0.0',
    enhanced_role_system: true,
    documentation: {
      auth: '/api/auth',
      public: '/api/public',
      customer: '/api/customer',
      staff: {
        kasir: '/api/staff/kasir',
        operator: '/api/staff/operator',
        manager: '/api/staff/manager',
        supervisor: '/api/staff/supervisor'
      },
      legacy: {
        user: '/api/user',
        pengelola: '/api/pengelola'
      }
    },
    features: [
      'role_based_access_control',
      'auto_generation_fields',
      'conflict_detection',
      'payment_gateway_integration',
      'audit_trail',
      'jsonb_support',
      'backward_compatibility'
    ],
    roles: {
      enhanced: [
        'pengunjung (Level 1)',
        'penyewa (Level 2)',
        'staff_kasir (Level 3)',
        'operator_lapangan (Level 4)',
        'manajer_futsal (Level 5)',
        'supervisor_sistem (Level 6)'
      ]
    }
  });
});

router.get('/routes', (req, res) => {
  res.json({
    success: true,
    data: {
      authentication: {
        base_path: '/api/auth',
        endpoints: [
          'POST /register - Register new user',
          'POST /login - Login user',
          'POST /logout - Logout user',
          'GET /profile - Get user profile',
          'POST /refresh - Refresh token',
          'GET /verify - Verify token',
          'GET /roles - Get available roles'
        ]
      },
      public: {
        base_path: '/api/public',
        endpoints: [
          'GET /system-info - Get system information',
          'GET /fields - Get available fields',
          'GET /fields/:id - Get field detail',
          'GET /fields/:id/availability - Get field availability',
          'GET /field-types - Get field types',
          'GET /field-locations - Get field locations',
          'GET /health - Health check',
          'GET /version - Get API version'
        ]
      },
      customer: {
        base_path: '/api/customer',
        endpoints: [
          'GET /profile - Get customer profile',
          'PUT /profile - Update customer profile',
          'GET /fields - Get available fields',
          'POST /bookings - Create booking',
          'GET /bookings - Get customer bookings',
          'GET /bookings/:id - Get booking detail',
          'PUT /bookings/:id/cancel - Cancel booking',
          'GET /dashboard - Get customer dashboard'
        ]
      },
      staff_kasir: {
        base_path: '/api/staff/kasir',
        endpoints: [
          'GET /dashboard - Get kasir dashboard',
          'GET /payments - Get all payments',
          'GET /payments/pending - Get pending payments',
          'GET /payments/:id - Get payment detail',
          'POST /payments/manual - Process manual payment',
          'PUT /payments/:id/confirm - Confirm payment',
          'GET /statistics - Get payment statistics',
          'GET /daily-report - Get daily cash report'
        ]
      },
      staff_operator: {
        base_path: '/api/staff/operator',
        endpoints: [
          'GET /dashboard - Get operator dashboard',
          'GET /fields - Get assigned fields',
          'PUT /fields/:id/status - Update field status',
          'GET /fields/:field_id/bookings - Get field bookings',
          'GET /schedule/today - Get today schedule',
          'PUT /bookings/:id/confirm - Confirm booking',
          'PUT /bookings/:id/complete - Complete booking',
          'GET /statistics - Get operator statistics'
        ]
      },
      staff_manager: {
        base_path: '/api/staff/manager',
        endpoints: [
          'GET /dashboard - Get manager dashboard',
          'GET /users - Get all users for management',
          'PUT /users/:id/role - Update user role',
          'PUT /users/:id/status - Activate/Deactivate user',
          'GET /fields - Get all fields for management',
          'POST /fields - Create new field',
          'PUT /fields/:id - Update field',
          'GET /analytics - Get business analytics'
        ]
      },
      staff_supervisor: {
        base_path: '/api/staff/supervisor',
        endpoints: [
          'GET /dashboard - Get supervisor dashboard',
          'GET /system-health - Get system health monitoring',
          'POST /staff - Create new staff user',
          'GET /users - Get all users with full access',
          'PUT /users/:id/role - Force update user role',
          'GET /analytics - Get comprehensive system analytics',
          'GET /audit-logs - Get audit logs'
        ]
      },
      admin_role_management: {
        base_path: '/api/admin/role-management',
        endpoints: [
          'GET /dashboard - Role management dashboard',
          'GET /users - Users for role management',
          'POST /request-change - Request role change',
          'PUT /change-role - Direct role change',
          'GET /requests - Get role change requests',
          'PUT /requests/:id/approve - Approve role change',
          'PUT /requests/:id/reject - Reject role change',
          'GET /audit-trail - Role change history',
          'POST /onboarding - Create employee onboarding',
          'GET /onboarding - Get onboarding records',
          'PUT /onboarding/:id/complete - Complete onboarding'
        ]
      }
    }
  });
});

router.get('/permissions', (req, res) => {
  res.json({
    success: true,
    data: {
      role_hierarchy: {
        'pengunjung': {
          level: 1,
          permissions: ['read_public_fields', 'view_availability']
        },
        'penyewa': {
          level: 2,
          permissions: ['create_booking', 'view_own_bookings', 'cancel_own_booking', 'update_profile']
        },
        'staff_kasir': {
          level: 3,
          permissions: ['process_payments', 'confirm_payments', 'view_payment_reports', 'manual_payment_entry']
        },
        'operator_lapangan': {
          level: 4,
          permissions: ['manage_assigned_fields', 'confirm_bookings', 'complete_bookings', 'update_field_status']
        },
        'manajer_futsal': {
          level: 5,
          permissions: ['manage_all_fields', 'view_all_reports', 'manage_staff', 'business_analytics']
        },
        'supervisor_sistem': {
          level: 6,
          permissions: ['full_system_access', 'user_management', 'system_configuration', 'audit_logs']
        }
      },
      inheritance: 'Higher level roles inherit all permissions from lower levels'
    }
  });
});

module.exports = router;
