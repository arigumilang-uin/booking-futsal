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

// New feature controllers
const {
  requestPasswordReset,
  validateResetToken,
  resetPassword
} = require('../controllers/auth/passwordResetController');

const {
  sendEmailVerification,
  verifyEmail,
  checkVerificationStatus
} = require('../controllers/auth/emailVerificationController');

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

// =====================================================
// PASSWORD RESET ROUTES
// =====================================================

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', requestPasswordReset);

/**
 * @route   GET /api/auth/reset-password/:token
 * @desc    Validate password reset token
 * @access  Public
 */
router.get('/reset-password/:token', validateResetToken);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 * @body    { token, new_password, confirm_password }
 */
router.post('/reset-password', resetPassword);

// =====================================================
// EMAIL VERIFICATION ROUTES
// =====================================================

/**
 * @route   POST /api/auth/send-verification
 * @desc    Send email verification
 * @access  Public
 * @body    { email }
 */
router.post('/send-verification', sendEmailVerification);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 * @body    { token }
 */
router.post('/verify-email', verifyEmail);

/**
 * @route   GET /api/auth/verification-status/:email
 * @desc    Check email verification status
 * @access  Public
 */
router.get('/verification-status/:email', checkVerificationStatus);

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
      'GET /api/auth/roles',
      'POST /api/auth/forgot-password',
      'GET /api/auth/reset-password/:token',
      'POST /api/auth/reset-password',
      'POST /api/auth/send-verification',
      'POST /api/auth/verify-email'
    ]
  });
});

/**
 * @route   GET /api/auth/test-features
 * @desc    Test new features without dependencies
 * @access  Public
 */
router.get('/test-features', (req, res) => {
  res.json({
    success: true,
    message: 'New features endpoints available',
    features: {
      email_service: {
        configured: !!process.env.SMTP_USER,
        endpoints: [
          'POST /api/auth/forgot-password',
          'POST /api/auth/send-verification'
        ]
      },
      password_reset: {
        table_required: 'password_resets',
        endpoints: [
          'POST /api/auth/forgot-password',
          'GET /api/auth/reset-password/:token',
          'POST /api/auth/reset-password'
        ]
      },
      google_maps: {
        configured: !!process.env.GOOGLE_MAPS_API_KEY,
        endpoints: [
          'GET /api/public/directions',
          'GET /api/public/fields/:id/directions',
          'GET /api/public/nearby-places'
        ]
      },
      weather: {
        configured: !!process.env.OPENWEATHER_API_KEY,
        endpoints: [
          'GET /api/public/weather',
          'GET /api/public/weather/forecast',
          'GET /api/public/fields/weather'
        ]
      }
    }
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
