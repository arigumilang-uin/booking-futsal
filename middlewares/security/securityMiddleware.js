const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Trust Railway proxy
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/' || req.path === '/api/public/health';
  }
});

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Trust Railway proxy
});

const paymentRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: {
    error: 'Too many payment attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Trust Railway proxy
});

const validateInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  const suspiciousPatterns = [
    /(\<script|\<iframe|\<object)/i,
    /(union.*select|select.*from|insert.*into|delete.*from)/i,
    /(\.\.\/|\.\.\\)/,
    /(eval\(|javascript:)/i
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));

  if (isSuspicious) {
    console.warn('🚨 Suspicious request detected:', {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      data: requestData
    });
  }

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 5000) {
      console.warn('⏱️ Slow request detected:', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        status: res.statusCode
      });
    }
  });

  next();
};

const corsSecurityCheck = (req, res, next) => {
  const origin = req.get('Origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://booking-futsal-frontend.vercel.app'
  ];

  if (origin && !allowedOrigins.includes(origin)) {
    console.warn('🚨 Suspicious origin detected:', {
      origin,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  next();
};

const validateApiKey = (req, res, next) => {
  const apiKey = req.get('X-API-Key') || req.query.api_key;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    console.warn('⚠️ API_KEY not configured in environment');
    return next();
  }

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      error: 'Invalid or missing API key'
    });
  }

  next();
};

/**
 * Request size limit middleware
 */
const requestSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      const maxSizeInMB = parseInt(maxSize);
      
      if (sizeInMB > maxSizeInMB) {
        return res.status(413).json({
          error: `Request too large. Maximum size is ${maxSize}`,
          code: 'REQUEST_TOO_LARGE'
        });
      }
    }
    
    next();
  };
};

/**
 * IP whitelist middleware (untuk admin endpoints)
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next(); // No whitelist configured
    }

    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      console.warn('🚨 Unauthorized IP access attempt:', {
        ip: clientIP,
        url: req.originalUrl,
        timestamp: new Date().toISOString()
      });
      
      return res.status(403).json({
        error: 'Access denied from this IP address',
        code: 'IP_NOT_WHITELISTED'
      });
    }
    
    next();
  };
};

module.exports = {
  helmetConfig,
  generalRateLimit,
  authRateLimit,
  paymentRateLimit,
  validateInput,
  securityLogger,
  corsSecurityCheck,
  validateApiKey,
  requestSizeLimit,
  ipWhitelist
};
