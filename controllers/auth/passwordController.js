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
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Current password, new password, and confirm password are required'
        };
        // In production, this would be sent to monitoring service
    }

    // Validate password match
    if (new_password !== confirm_password) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'New password and confirm password do not match'
        };
        // In production, this would be sent to monitoring service
    }

    // Validate new password strength
    const passwordValidation = authUtilityService.validatePassword(new_password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Password validation failed',
          errors: passwordValidation.errors
        };
        // In production, this would be sent to monitoring service
    }

    // Get current user
    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'User not found'
        };
        // In production, this would be sent to monitoring service
    }

    // Verify current password
    const isCurrentPasswordValid = await authUtilityService.comparePassword(current_password, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Current password is incorrect'
        };
        // In production, this would be sent to monitoring service
    }

    // Hash new password
    const hashedNewPassword = await authUtilityService.hashPassword(new_password);

    // Update password
    await updateUserPassword(userId, hashedNewPassword);

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: 'Password changed successfully'
      };
      // In production, this would be sent to monitoring service

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Failed to change password'
      };
      // In production, this would be sent to monitoring service
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
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Password is required'
        };
        // In production, this would be sent to monitoring service
    }

    const hash = await authUtilityService.hashPassword(password);

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        password: password,
        hash: hash,
        message: 'Use this hash in database'
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        error: error.message
      };
      // In production, this would be sent to monitoring service
  }
};

module.exports = {
  changePassword,
  generatePasswordHash
};
