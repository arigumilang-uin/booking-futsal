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
      return res.status(400).json({
        error: 'Invalid role specified'
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required'
      });
    }

    // Hybrid email validation (Format + Domain)
    const emailValidation = await emailValidationService.validateComplete(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        error: emailValidation.reason,
        validation_step: emailValidation.step,
        suggestion: emailValidation.reason.includes('Mungkin maksud Anda') ? emailValidation.reason : undefined
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long'
      });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Email sudah terdaftar'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role: userRole
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res.cookie('token', token, cookieOptions);

    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: userResponse,
      token: process.env.NODE_ENV === 'development' ? token : undefined
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Gagal registrasi pengguna'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        error: 'Pengguna tidak ditemukan'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account is deactivated'
      });
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

      return res.status(401).json({
        error: 'Password salah'
      });
    }

    await updateLastLogin(user.id);

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

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
      success: true,
      message: 'Login successful',
      user: userResponse,
      token: process.env.NODE_ENV === 'development' ? token : undefined
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Gagal login'
    });
  }
};

const logout = async (req, res) => {
  try {
    // Log logout if user is authenticated
    if (req.user) {
      await logoutAuditLogger(
        req.user.id,
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent'],
        { email: req.user.email }
      );
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.json({
      success: true,
      message: 'Logout berhasil'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Gagal logout'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const user = await getUserByEmail(req.user.email);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

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
        expires_in: '7d',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  refreshToken
};
