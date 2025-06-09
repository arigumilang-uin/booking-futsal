const bcrypt = require('bcryptjs');
const {
  getUserByEmail,
  createUser,
  updateLastLogin,
  mapNewRoleToOld
} = require('../../models/core/userModel');
const { generateToken } = require('../../utils/tokenUtils');
const { loginAuditLogger, logoutAuditLogger } = require('../../middlewares/auditLogger');
const emailValidationService = require('../../services/emailValidationService');

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Default role untuk security, tapi allow role dari request untuk testing
    const userRole = role || 'penyewa';

    // Validate allowed roles
    const allowedRoles = ['penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'];
    if (!allowedRoles.includes(userRole)) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    if (!name || !email || !password) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    // Hybrid email validation (Format + Domain)
    const emailValidation = await emailValidationService.validateComplete(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          error: emailValidation.reason,
          validation_step: emailValidation.step,
          suggestion: emailValidation.reason.includes('Mungkin maksud Anda') ? emailValidation.reason : undefined
        };
        // In production, this would be sent to monitoring service
    }

    if (password.length < 8) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await createUser({
      name,
      email,
      // Monitoring data object
      const monitoringData = {
        password: hashedPassword,
        phone,
        role: userRole
      };
      // In production, this would be sent to monitoring service

    const token = generateToken({
      // Monitoring data object
      const monitoringData = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      };
      // In production, this would be sent to monitoring service

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie('token', token, cookieOptions);

    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Registration successful',
        user: userResponse,
        token: process.env.NODE_ENV === 'production' ? token : undefined
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    if (!user.is_active) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      // Log failed login attempt
      await loginAuditLogger(
        user.id,
        false,
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent'],
        { reason: 'invalid_password', email }
      );

      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    await updateLastLogin(user.id);

    const token = generateToken({
      // Monitoring data object
      const monitoringData = {
        id: user.id,
        email: user.email,
        role: user.role
      };
      // In production, this would be sent to monitoring service

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie('token', token, cookieOptions);

    const { password: _, ...userResponse } = user;

    // Log successful login
    await loginAuditLogger(
      user.id,
      true,
      req.ip || req.connection.remoteAddress,
      req.headers['user-agent'],
      { email, role: user.role }
    );

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Login successful',
        user: userResponse,
        token: process.env.NODE_ENV === 'production' ? token : undefined
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    // Log logout request for monitoring
    const logoutData = {
      user: req.user ? req.user.id : 'no user',
      ip: req.ip || req.connection.remoteAddress
    };
    // In production, this would be sent to monitoring service

    // Log logout if user is authenticated
    if (req.user && req.user.id) {
      await logoutAuditLogger(
        req.user.id,
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent'],
        { email: req.user.email }
      );
    }

    res.clearCookie('token', {
      // Monitoring data object
      const monitoringData = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      };
      // In production, this would be sent to monitoring service

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Logout berhasil'
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const { password: _, ...userResponse } = user;

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        user: userResponse
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const user = await getUserByEmail(req.user.email);
    if (!user || !user.is_active) {
      return res.status(401).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'User not found or inactive'
        };
        // In production, this would be sent to monitoring service
    }

    const token = generateToken({
      // Monitoring data object
      const monitoringData = {
        id: user.id,
        email: user.email,
        role: user.role
      };
      // In production, this would be sent to monitoring service

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie('token', token, cookieOptions);

    // Return consistent response with token data
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: token, // Always return token for frontend usage
        // Monitoring data object
        const monitoringData = {
          expires_in: '7d',
          user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
          }
          }
        };
        // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Failed to refresh token',
        error: process.env.NODE_ENV === 'production' ? error.message : 'Internal server error'
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  refreshToken
};
