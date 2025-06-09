// middlewares/auditLogger.js - Automatic audit logging middleware
const { createAuditLog } = require('../models/system/auditLogModel');

// Extract resource info from request
const extractResourceInfo = (req) => {
  const path = req.route?.path || req.path;
  const method = req.method;

  // Map routes to resource types
  const resourceMapping = {
    '/api/admin/users': 'user',
    '/api/admin/fields': 'field',
    '/api/admin/bookings': 'booking',
    '/api/admin/payments': 'payment',
    '/api/staff/kasir/payments': 'payment',
    '/api/staff/manager/bookings': 'booking',
    '/api/staff/operator/bookings': 'booking',
    '/api/customer/bookings': 'booking',
    '/api/customer/profile': 'user',
    '/api/auth/login': 'auth',
    '/api/auth/logout': 'auth',
    '/api/auth/register': 'user'
  };

  // Find matching resource type
  let resourceType = 'unknown';
  let tableName = 'unknown';

  for (const [route, type] of Object.entries(resourceMapping)) {
    if (path.includes(route)) {
      resourceType = type;
      tableName = type === 'auth' ? 'users' : `${type}s`;
      break;
    }
  }

  // Extract resource ID from path parameters
  const resourceId = req.params.id || req.params.userId || req.params.fieldId ||
    req.params.bookingId || req.params.paymentId || null;

  // Map HTTP methods to actions
  const actionMapping = {
    'GET': 'VIEW',
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE'
  };

  // Special cases for auth
  if (path.includes('/login')) {
    return { action: 'LOGIN', resourceType: 'user', tableName: 'users', resourceId: null };
  }
  if (path.includes('/logout')) {
    return { action: 'LOGOUT', resourceType: 'user', tableName: 'users', resourceId: null };
  }
  if (path.includes('/register')) {
    return { action: 'REGISTER', resourceType: 'user', tableName: 'users', resourceId: null };
  }

  return {
    action: actionMapping[method] || 'UNKNOWN',
    resourceType,
    tableName,
    resourceId: resourceId ? parseInt(resourceId) : null
  };
};

// Specific audit loggers for different scenarios
const loginAuditLogger = async (userId, success, ipAddress, userAgent, additionalInfo = {}) => {
  try {
    await createAuditLog({
      user_id: userId,
      action: success ? 'LOGIN' : 'LOGIN_FAILED',
      resource_type: 'user',
      table_name: 'users',
      resource_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      additional_info: {
        success,
        timestamp: new Date().toISOString(),
        ...additionalInfo
      }
    });
  } catch (error) {
    console.error('Login audit logging error:', error);
  }
};

const logoutAuditLogger = async (userId, ipAddress, userAgent, additionalInfo = {}) => {
  try {
    await createAuditLog({
      user_id: userId,
      action: 'LOGOUT',
      resource_type: 'user',
      table_name: 'users',
      resource_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      additional_info: {
        timestamp: new Date().toISOString(),
        ...additionalInfo
      }
    });
  } catch (error) {
    console.error('Logout audit logging error:', error);
  }
};

const dataChangeAuditLogger = async (userId, action, resourceType, resourceId, oldValues, newValues, ipAddress, userAgent) => {
  try {
    await createAuditLog({
      user_id: userId,
      action: action.toUpperCase(),
      resource_type: resourceType,
      table_name: `${resourceType}s`,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: userAgent,
      additional_info: {
        timestamp: new Date().toISOString(),
        change_type: 'data_modification'
      }
    });
  } catch (error) {
    console.error('Data change audit logging error:', error);
  }
};

// Main audit logging middleware
const auditLogger = (options = {}) => {
  const {
    excludePaths = ['/api/auth/verify', '/api/health', '/api/status', '/api/staff/supervisor/system-health', '/api/staff/supervisor/database-stats'],
    excludeMethods = ['OPTIONS', 'GET'],
    logSuccessOnly = true
  } = options;

  return async (req, res, next) => {
    // Skip if path or method is excluded
    if (excludePaths.some(path => req.path.includes(path)) ||
      excludeMethods.includes(req.method)) {
      return next();
    }

    console.log('🔍 Audit middleware triggered:', { method: req.method, path: req.path, user: req.user?.id });

    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;

    let responseData = null;
    let statusCode = null;

    // Override res.send to capture response
    res.send = function (data) {
      responseData = data;
      statusCode = res.statusCode;
      return originalSend.call(this, data);
    };

    // Override res.json to capture response
    res.json = function (data) {
      responseData = data;
      statusCode = res.statusCode;
      return originalJson.call(this, data);
    };

    // Continue with request processing
    next();

    // Log after response is sent
    res.on('finish', async () => {
      try {
        // Skip logging if configured to log success only and request failed
        if (logSuccessOnly && statusCode >= 400) {
          console.log('⚠️ Skipping audit log due to error status:', statusCode);
          return;
        }

        const { action, resourceType, tableName, resourceId } = extractResourceInfo(req);

        // Get user info from request
        const userId = req.rawUser?.id || req.user?.id || null;
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
        const userAgent = req.headers['user-agent'];

        console.log('📝 Creating audit log:', { action, resourceType, tableName, userId, statusCode });

        // Prepare audit log data
        const auditData = {
          user_id: userId,
          action: action,
          resource_type: resourceType,
          table_name: tableName,
          resource_id: resourceId,
          old_values: req.method === 'PUT' || req.method === 'PATCH' ? req.body : null,
          new_values: req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' ?
            (responseData && typeof responseData === 'object' ? responseData : null) : null,
          ip_address: ipAddress,
          user_agent: userAgent,
          additional_info: {
            method: req.method,
            path: req.path,
            status_code: statusCode,
            query_params: Object.keys(req.query).length > 0 ? req.query : null,
            timestamp: new Date().toISOString(),
            success: statusCode < 400
          }
        };

        // Create audit log entry
        await createAuditLog(auditData);
        console.log('✅ Audit log created successfully');

      } catch (error) {
        console.error('❌ Audit logging error:', error);
        // Don't throw error to avoid breaking the main request
      }
    });
  };
};

module.exports = {
  auditLogger,
  loginAuditLogger,
  logoutAuditLogger,
  dataChangeAuditLogger
};
