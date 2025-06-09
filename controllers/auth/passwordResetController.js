const bcrypt = require('bcryptjs');
const pool = require('../../config/db');
const emailService = require('../../services/emailService');
const {
  createPasswordResetToken,
  validatePasswordResetToken,
  markPasswordResetAsUsed,
  checkRecentPasswordResetAttempts
} = require('../../models/auth/passwordResetModel');

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Email diperlukan'
        };
        // In production, this would be sent to monitoring service
    }

    // Check if user exists
    const userQuery = `SELECT id, name, email, is_active FROM users WHERE email = $1`;
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({
        // Monitoring data object
        const monitoringData = {
          success: true,
          message: 'Jika email terdaftar, link reset password akan dikirim'
        };
        // In production, this would be sent to monitoring service
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Akun tidak aktif'
        };
        // In production, this would be sent to monitoring service
    }

    // Check rate limiting
    const recentAttempts = await checkRecentPasswordResetAttempts(email);
    if (!recentAttempts.canRequest) {
      return res.status(429).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Terlalu banyak permintaan reset password. Coba lagi dalam 5 menit.'
        };
        // In production, this would be sent to monitoring service
    }

    // Create reset token
    const resetData = await createPasswordResetToken(email);

    // Generate reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetData.token}`;

    // Send email
    const emailTemplate = emailService.generatePasswordResetEmail(
      user.name,
      resetLink,
      resetData.token
    );

    const emailResult = await emailService.sendEmail({
      // Monitoring data object
      const monitoringData = {
        to: email,
        subject: 'Reset Password - Futsal Booking System',
        html: emailTemplate.html,
        text: emailTemplate.text
      };
      // In production, this would be sent to monitoring service

    if (!emailResult.success) {
      return res.status(500).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Gagal mengirim email reset password'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Link reset password telah dikirim ke email Anda',
        data: {
        email: email,
        expires_in: '1 hour'
        }
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal memproses permintaan reset password'
      };
      // In production, this would be sent to monitoring service
  }
};

// Validate reset token
const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Token diperlukan'
        };
        // In production, this would be sent to monitoring service
    }

    const validation = await validatePasswordResetToken(token);

    if (!validation.valid) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: validation.error
        };
        // In production, this would be sent to monitoring service
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Token valid',
        data: {
        email: validation.data.email,
        user_name: validation.data.user_name,
        expires_at: validation.data.expires_at
        }
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Validate reset token error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal memvalidasi token'
      };
      // In production, this would be sent to monitoring service
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, new_password, confirm_password } = req.body;

    if (!token || !new_password || !confirm_password) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Token, password baru, dan konfirmasi password diperlukan'
        };
        // In production, this would be sent to monitoring service
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Password dan konfirmasi password tidak cocok'
        };
        // In production, this would be sent to monitoring service
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Password minimal 6 karakter'
        };
        // In production, this would be sent to monitoring service
    }

    // Validate token
    const validation = await validatePasswordResetToken(token);

    if (!validation.valid) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: validation.error
        };
        // In production, this would be sent to monitoring service
    }

    const { email, user_id } = validation.data;

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Update user password
    const updateQuery = `
      UPDATE users
      SET password = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, name
    `;

    const updateResult = await pool.query(updateQuery, [hashedPassword, user_id]);

    if (updateResult.rows.length === 0) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'User tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    // Mark token as used
    await markPasswordResetAsUsed(token);

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Password berhasil direset',
        data: {
        email: email,
        reset_at: new Date().toISOString()
        }
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mereset password'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  requestPasswordReset,
  validateResetToken,
  resetPassword
};
