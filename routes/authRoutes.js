// routes/authRoutes.js - Enhanced Authentication Routes
const express = require('express');
const router = express.Router();

// Controllers
const {
  register,
  login,
  logout,
  getProfile,
  refreshToken
} = require('../controllers/auth/authController');

// Middlewares
const { requireAuth } = require('../middlewares/auth/authMiddleware');

// =====================================================
// AUTHENTICATION ROUTES
// =====================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 * @body    { name, email, password, phone, role }
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (Authenticated users)
 */
router.get('/profile', requireAuth, getProfile);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT token
 * @access  Private (Authenticated users)
 */
router.post('/refresh', requireAuth, refreshToken);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify token validity
 * @access  Private (Authenticated users)
 */
router.get('/verify', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name
      }
    }
  });
});

/**
 * @route   GET /api/auth/health
 * @desc    Auth routes health check
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/auth/profile',
      'POST /api/auth/refresh',
      'GET /api/auth/verify',
      'GET /api/auth/roles'
    ]
  });
});

/**
 * @route   GET /api/auth/roles
 * @desc    Get available roles in system
 * @access  Public
 */
router.get('/roles', (req, res) => {
  res.json({
    success: true,
    data: {
      roles: [
        {
          value: 'user',
          label: 'Customer',
          description: 'Regular customer who can book fields',
          level: 2
        },
        {
          value: 'pengelola',
          label: 'Staff',
          description: 'Staff member with operational access',
          level: 4
        },
        {
          value: 'admin',
          label: 'Administrator',
          description: 'System administrator with full access',
          level: 6
        }
      ],
      enhanced_roles: [
        {
          value: 'pengunjung',
          label: 'Guest',
          description: 'Guest user with read-only access',
          level: 1
        },
        {
          value: 'penyewa',
          label: 'Customer',
          description: 'Customer who can book fields',
          level: 2
        },
        {
          value: 'staff_kasir',
          label: 'Cashier Staff',
          description: 'Staff responsible for payment processing',
          level: 3
        },
        {
          value: 'operator_lapangan',
          label: 'Field Operator',
          description: 'Staff responsible for field operations',
          level: 4
        },
        {
          value: 'manajer_futsal',
          label: 'Futsal Manager',
          description: 'Manager with business management access',
          level: 5
        },
        {
          value: 'supervisor_sistem',
          label: 'System Supervisor',
          description: 'Supervisor with full system access',
          level: 6
        }
      ]
    }
  });
});

module.exports = router;
