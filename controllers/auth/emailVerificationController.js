const pool = require('../../config/db');
const crypto = require('crypto');
const emailService = require('../../services/emailService');

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email verification
const sendEmailVerification = async (req, res) => {
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
    const userQuery = `
      SELECT id, name, email, is_verified, email_verified_at, is_active
      FROM users WHERE email = $1
    `;
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'User tidak ditemukan'
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

    if (user.is_verified && user.email_verified_at) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Email sudah terverifikasi'
        };
        // In production, this would be sent to monitoring service
    }

    // Generate verification token
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token in system_settings (temporary approach)
    const tokenKey = `email_verification_${user.id}`;
    const tokenData = {
      token,
      email,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    };

    const settingQuery = `
      INSERT INTO system_settings (key, value, description, category, is_public)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `;

    await pool.query(settingQuery, [
      tokenKey,
      JSON.stringify(tokenData),
      'Email verification token',
      'verification',
      false
    ]);

    // Generate verification link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

    // Send email
    const emailTemplate = emailService.generateEmailVerificationEmail(
      user.name,
      verificationLink,
      token
    );

    const emailResult = await emailService.sendEmail({
      // Monitoring data object
      const monitoringData = {
        to: email,
        subject: 'Verifikasi Email - Futsal Booking System',
        html: emailTemplate.html,
        text: emailTemplate.text
      };
      // In production, this would be sent to monitoring service

    if (!emailResult.success) {
      return res.status(500).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Gagal mengirim email verifikasi'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Email verifikasi telah dikirim',
        data: {
        email: email,
        expires_in: '24 hours'
        }
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Send email verification error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengirim email verifikasi'
      };
      // In production, this would be sent to monitoring service
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Token diperlukan'
        };
        // In production, this would be sent to monitoring service
    }

    // Find verification token in system_settings
    const tokenQuery = `
      SELECT key, value FROM system_settings
      WHERE key LIKE 'email_verification_%' AND value::text LIKE '%"${token}"%'
    `;

    const tokenResult = await pool.query(tokenQuery);

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Token tidak valid'
        };
        // In production, this would be sent to monitoring service
    }

    const tokenData = JSON.parse(tokenResult.rows[0].value.value || tokenResult.rows[0].value);
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Token sudah expired'
        };
        // In production, this would be sent to monitoring service
    }

    // Update user verification status
    const updateQuery = `
      UPDATE users
      SET is_verified = true, email_verified_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND email = $2
      RETURNING id, email, name, is_verified, email_verified_at
    `;

    const updateResult = await pool.query(updateQuery, [tokenData.user_id, tokenData.email]);

    if (updateResult.rows.length === 0) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'User tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    // Delete verification token
    const deleteTokenQuery = `DELETE FROM system_settings WHERE key = $1`;
    await pool.query(deleteTokenQuery, [tokenResult.rows[0].key]);

    const user = updateResult.rows[0];

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Email berhasil diverifikasi',
        data: {
        user_id: user.id,
        email: user.email,
        name: user.name,
        verified_at: user.email_verified_at
        }
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal memverifikasi email'
      };
      // In production, this would be sent to monitoring service
  }
};

// Check verification status
const checkVerificationStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const userQuery = `
      SELECT id, email, name, is_verified, email_verified_at
      FROM users WHERE email = $1
    `;
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'User tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    const user = userResult.rows[0];

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          email: user.email,
          is_verified: user.is_verified,
          verified_at: user.email_verified_at
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengecek status verifikasi'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  sendEmailVerification,
  verifyEmail,
  checkVerificationStatus
};
