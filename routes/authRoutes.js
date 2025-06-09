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

// Email feature controllers
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

const { changePassword } = require('../controllers/auth/passwordController');

// Middlewares
const { requireAuth } = require('../middlewares/auth/authMiddleware');

// Services
const roleService = require('../services/roleService');

// =====================================================
// AUTHENTICATION ROUTES - CLEAN & OPTIMIZED
// =====================================================

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - User login
router.post('/login', login);

// POST /api/auth/logout - User logout
router.post('/logout', requireAuth, logout);

router.get('/profile', requireAuth, getProfile);

router.post('/refresh', requireAuth, refreshToken);

// GET /api/auth/roles - Get system roles
router.get('/roles', (_, res) => {
  res.json({ success: true, data: roleService.getAllRoles()
  });
});

// POST /api/auth/change-password - Change user password
router.post('/change-password', requireAuth, changePassword);

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

router.post('/forgot-password', requestPasswordReset);

// GET /api/auth/reset-password/:token - Validate reset token
router.get('/reset-password/:token', validateResetToken);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', resetPassword);

// =====================================================
// EMAIL VERIFICATION ROUTES
// =====================================================

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
router.get('/health', (_, res) => {
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

module.exports = router;
