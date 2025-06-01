// routes/authRoutes.js - Simple Authentication Routes for Testing
const express = require('express');
const router = express.Router();

// Simple controller implementations for testing
const register = (req, res) => {
  res.json({ success: true, message: 'Register endpoint working' });
};

const login = (req, res) => {
  res.json({ success: true, message: 'Login endpoint working' });
};

const logout = (req, res) => {
  res.json({ success: true, message: 'Logout endpoint working' });
};

const getProfile = (req, res) => {
  res.json({ success: true, message: 'Get profile endpoint working' });
};

const refreshToken = (req, res) => {
  res.json({ success: true, message: 'Refresh token endpoint working' });
};

// =====================================================
// AUTHENTICATION ROUTES
// =====================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public (Guest only)
 * @body    { name, email, password, phone, role }
 */
router.post('/register', 
  guestOnly,
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public (Guest only)
 * @body    { email, password }
 */
router.post('/login', 
  guestOnly,
  authRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  login,
  clearRateLimit
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private (Authenticated users)
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
    user: req.user
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
