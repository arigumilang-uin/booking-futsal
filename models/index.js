// Models Index - Centralized model exports for easier imports
// This provides backward compatibility while supporting new organized structure

// Core Models
const userModel = require('./core/userModel');

// Business Models
const bookingModel = require('./business/bookingModel');
const fieldModel = require('./business/fieldModel');
const paymentModel = require('./business/paymentModel');

// Enhanced Features Models
const notificationModel = require('./enhanced/notificationModel');
const reviewModel = require('./enhanced/reviewModel');
const favoritesModel = require('./enhanced/favoritesModel');
const promotionModel = require('./enhanced/promotionModel');

// System Models
const systemSettingsModel = require('./system/systemSettingsModel');
const auditLogModel = require('./system/auditLogModel');
const roleManagementModel = require('./system/roleManagementModel');

// Tracking Models
const bookingHistoryModel = require('./tracking/bookingHistoryModel');
const paymentLogModel = require('./tracking/paymentLogModel');

// Export all models for backward compatibility
module.exports = {
  // Core
  userModel,
  roleManagementModel,
  
  // Business
  bookingModel,
  fieldModel,
  paymentModel,
  
  // Enhanced
  notificationModel,
  reviewModel,
  favoritesModel,
  promotionModel,
  
  // System
  systemSettingsModel,
  auditLogModel,
  
  // Tracking
  bookingHistoryModel,
  paymentLogModel,
  
  // Domain-based exports for new imports
  core: {
    user: userModel,
    roleManagement: roleManagementModel
  },
  
  business: {
    booking: bookingModel,
    field: fieldModel,
    payment: paymentModel
  },
  
  enhanced: {
    notification: notificationModel,
    review: reviewModel,
    favorites: favoritesModel,
    promotion: promotionModel
  },
  
  system: {
    settings: systemSettingsModel,
    auditLog: auditLogModel,
    roleManagement: roleManagementModel
  },
  
  tracking: {
    bookingHistory: bookingHistoryModel,
    paymentLog: paymentLogModel
  }
};
