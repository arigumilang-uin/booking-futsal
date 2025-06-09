/**
 * @fileoverview Password Controller - Clean & Optimized
 * @description Controller untuk mengelola password operations
 * @version 2.0.0
 */

const { getUserByEmail, updateUserPassword } = require('../../models/core/userModel');
const authUtilityService = require('../../services/authUtilityService');

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password, confirm_password } = req.body;

    // Validate required fields
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirm password are required'
      });
    }

    // Validate password match
    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    // Validate new password strength
    const passwordValidation = authUtilityService.validatePassword(new_password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errors: passwordValidation.errors
      });
    }

    // Get current user
    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await authUtilityService.comparePassword(current_password, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await authUtilityService.hashPassword(new_password);

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
};

/**
 * Generate password hash (development only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generatePasswordHash = async (req, res) => {
  try {
    const { password } = req.params;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const hash = await authUtilityService.hashPassword(password);

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
};

module.exports = {
  changePassword,
  generatePasswordHash
};
