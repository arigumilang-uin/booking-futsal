/**
 * Centralized Error Handler Middleware
 * Standardisasi error handling untuk semua controllers
 */

const logger = require('../utils/logger');

// Standard error response format
const createErrorResponse = (error, req) => {
  const timestamp = new Date().toISOString();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}`;
  
  // Default error structure
  let errorResponse = {
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp,
    request_id: requestId
  };

  // Handle different error types
  if (error.name === 'ValidationError') {
    errorResponse = {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.details || error.message,
      timestamp,
      request_id: requestId
    };
  } else if (error.name === 'UnauthorizedError' || error.message.includes('unauthorized')) {
    errorResponse = {
      success: false,
      error: 'Unauthorized access',
      code: 'UNAUTHORIZED',
      timestamp,
      request_id: requestId
    };
  } else if (error.name === 'ForbiddenError' || error.message.includes('forbidden')) {
    errorResponse = {
      success: false,
      error: 'Access forbidden',
      code: 'FORBIDDEN',
      timestamp,
      request_id: requestId
    };
  } else if (error.name === 'NotFoundError' || error.message.includes('not found')) {
    errorResponse = {
      success: false,
      error: 'Resource not found',
      code: 'NOT_FOUND',
      timestamp,
      request_id: requestId
    };
  } else if (error.code === '23505') { // PostgreSQL unique violation
    errorResponse = {
      success: false,
      error: 'Duplicate entry detected',
      code: 'DUPLICATE_ENTRY',
      timestamp,
      request_id: requestId
    };
  } else if (error.code === '23503') { // PostgreSQL foreign key violation
    errorResponse = {
      success: false,
      error: 'Referenced record not found',
      code: 'FOREIGN_KEY_VIOLATION',
      timestamp,
      request_id: requestId
    };
  } else if (error.code === '23502') { // PostgreSQL not null violation
    errorResponse = {
      success: false,
      error: 'Required field missing',
      code: 'REQUIRED_FIELD_MISSING',
      timestamp,
      request_id: requestId
    };
  }

  // Add debug info in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.debug = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }

  return errorResponse;
};

// Main error handler middleware
const errorHandler = (error, req, res, next) => {
  // Log error details
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  let statusCode = 500;
  
  if (error.name === 'ValidationError') {
    statusCode = 400;
  } else if (error.name === 'UnauthorizedError' || error.message.includes('unauthorized')) {
    statusCode = 401;
  } else if (error.name === 'ForbiddenError' || error.message.includes('forbidden')) {
    statusCode = 403;
  } else if (error.name === 'NotFoundError' || error.message.includes('not found')) {
    statusCode = 404;
  } else if (error.code === '23505' || error.code === '23503' || error.code === '23502') {
    statusCode = 400;
  }

  // Create standardized error response
  const errorResponse = createErrorResponse(error, req);
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Async error wrapper untuk controllers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error classes
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends Error {
  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Success response helper
const createSuccessResponse = (data, message = null, meta = null) => {
  const response = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
};

// Pagination helper
const createPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    pagination: {
      current_page: parseInt(page),
      per_page: parseInt(limit),
      total: parseInt(total),
      total_pages: totalPages,
      has_next_page: page < totalPages,
      has_prev_page: page > 1
    }
  };
};

// Performance monitoring wrapper
const performanceWrapper = (fn, operationName) => {
  return async (...args) => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      
      // Log slow operations (> 1000ms)
      if (duration > 1000) {
        logger.warn(`Slow operation detected: ${operationName}`, {
          duration: `${duration}ms`,
          operation: operationName
        });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Operation failed: ${operationName}`, {
        duration: `${duration}ms`,
        operation: operationName,
        error: error.message
      });
      throw error;
    }
  };
};

module.exports = {
  errorHandler,
  asyncHandler,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  createSuccessResponse,
  createPaginationMeta,
  performanceWrapper
};
