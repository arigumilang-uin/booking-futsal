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

// Middlewares
const { requireAuth } = require('../middlewares/auth/authMiddleware');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         role:
 *           type: string
 *           example: "penyewa"
 * tags:
 *   - name: Authentication
 *     description: Endpoint untuk autentikasi pengguna
 */

// =====================================================
// AUTHENTICATION ROUTES
// =====================================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register pengguna baru
 *     description: Endpoint untuk mendaftarkan pengguna baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Data tidak valid
 *       409:
 *         description: Email sudah terdaftar
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login pengguna
 *     description: Endpoint untuk autentikasi pengguna
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login berhasil
 *       400:
 *         description: Email atau password salah
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout pengguna
 *     description: Endpoint untuk logout pengguna
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil
 *       401:
 *         description: Token tidak valid
 */
router.post('/logout', requireAuth, logout);

router.get('/profile', requireAuth, getProfile);

router.post('/refresh', requireAuth, refreshToken);

router.get('/roles', (req, res) => {
  res.json({
    success: true,
    data: {
      roles: [
        {
          value: 'pengunjung',
          label: 'Guest (Pengunjung)',
          level: 1,
          description: 'Pengunjung yang dapat melihat informasi publik'
        },
        {
          value: 'penyewa',
          label: 'Customer (Penyewa)',
          level: 2,
          description: 'Customer yang dapat melakukan booking'
        },
        {
          value: 'staff_kasir',
          label: 'Cashier (Staff Kasir)',
          level: 3,
          description: 'Staff yang menangani pembayaran'
        },
        {
          value: 'operator_lapangan',
          label: 'Field Operator (Operator Lapangan)',
          level: 4,
          description: 'Staff yang mengelola lapangan dan booking'
        },
        {
          value: 'manajer_futsal',
          label: 'Manager (Manajer Futsal)',
          level: 5,
          description: 'Manager yang mengelola bisnis dan analytics'
        },
        {
          value: 'supervisor_sistem',
          label: 'System Supervisor (Supervisor Sistem)',
          level: 6,
          description: 'Supervisor dengan akses penuh sistem'
        }
      ],
      hierarchy: ['pengunjung', 'penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'],
      enhanced_features: {
        role_based_access: true,
        hierarchical_permissions: true,
        employee_management: true,
        audit_trail: true
      }
    }
  });
});

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirm password are required'
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const bcrypt = require('bcryptjs');
    const { getUserByEmail, updateUserPassword } = require('../models/core/userModel');

    // Get current user with password field
    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await updateUserPassword(userId, hashedNewPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

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
        smtp_host: process.env.SMTP_HOST || 'not set',
        smtp_user: process.env.SMTP_USER || 'not set',
        smtp_pass: process.env.SMTP_PASS ? 'set (hidden)' : 'not set',
        frontend_url: process.env.FRONTEND_URL || 'not set',
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
      // Maps and weather features removed
    }
  });
});

/**
 * @route   GET /api/auth/test-smtp
 * @desc    Test SMTP connection
 * @access  Public
 */
router.get('/test-smtp', async (req, res) => {
  try {
    const emailService = require('../services/emailService');

    // Force re-initialize email service
    emailService.initializeTransporter();

    const result = await emailService.verifyConnection();

    res.json({
      success: true,
      smtp_test: result,
      env_vars: {
        smtp_host: process.env.SMTP_HOST || 'not set',
        smtp_port: process.env.SMTP_PORT || 'not set',
        smtp_user: process.env.SMTP_USER || 'not set',
        smtp_pass: process.env.SMTP_PASS ? 'set (hidden)' : 'not set',
        app_name: process.env.APP_NAME || 'not set',
        frontend_url: process.env.FRONTEND_URL || 'not set'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/hash-password/:password
 * @desc    Generate bcrypt hash for password (development only)
 * @access  Public
 */
router.get('/hash-password/:password', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { password } = req.params;

    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);

    res.json({
      success: true,
      password: password,
      hash: hash,
      message: 'Use this hash in database'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/validate-email
 * @desc    Validate email using hybrid approach
 * @access  Public
 * @body    { email }
 */
router.post('/validate-email', async (req, res) => {
  try {
    const emailValidationService = require('../services/emailValidationService');
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email diperlukan'
      });
    }

    const result = await emailValidationService.validateComplete(email);

    res.json({
      success: result.valid,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/validate-email-quick
 * @desc    Quick email validation (format only)
 * @access  Public
 * @body    { email }
 */
router.post('/validate-email-quick', (req, res) => {
  try {
    const emailValidationService = require('../services/emailValidationService');
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email diperlukan'
      });
    }

    const result = emailValidationService.validateQuick(email);

    res.json({
      success: result.valid,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/validate-email-batch
 * @desc    Validate multiple emails at once
 * @access  Public
 * @body    { emails: [] }
 */
router.post('/validate-email-batch', async (req, res) => {
  try {
    const emailValidationService = require('../services/emailValidationService');
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({
        success: false,
        error: 'Array emails diperlukan'
      });
    }

    if (emails.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maksimal 10 email per batch'
      });
    }

    const results = await emailValidationService.validateBatch(emails);
    const stats = emailValidationService.getValidationStats(results);

    res.json({
      success: true,
      data: {
        results,
        statistics: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
