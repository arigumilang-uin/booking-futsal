const jwt = require('jsonwebtoken');
const { getUserById, getUserByIdRaw, updateLastLogin } = require('../../models/core/userModel');

const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const rawUser = await getUserByIdRaw(decoded.id);

    if (!rawUser) {
      return res.status(401).json({
        error: 'Invalid token. User not found.'
      });
    }

    if (!rawUser.is_active) {
      return res.status(401).json({
        error: 'Account is deactivated.'
      });
    }

    updateLastLogin(rawUser.id).catch(err => {
      console.error('Failed to update last login:', err);
    });

    req.user = rawUser;  // Use raw user with correct role
    req.rawUser = rawUser;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      req.user = null;
      req.rawUser = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserById(decoded.id);

    if (user && user.is_active) {
      req.user = user;
      const rawUser = await getUserByIdRaw(user.id);
      req.rawUser = rawUser;
    } else {
      req.user = null;
      req.rawUser = null;
    }

    next();
  } catch (error) {
    req.user = null;
    req.rawUser = null;
    next();
  }
};

const requireAuth = authMiddleware;

const guestOnly = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.status(403).json({
        error: 'Access denied. Already authenticated.'
      });
    } catch (error) {
      // Token invalid, lanjutkan sebagai guest
    }
  }

  next();
};

const verifyTokenOnly = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return res.status(401).json({
        error: 'Token tidak ditemukan'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired.'
      });
    }

    return res.status(401).json({
      error: 'Token tidak valid atau kedaluwarsa'
    });
  }
};

const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.body.email || '');
    const now = Date.now();

    for (const [k, v] of attempts.entries()) {
      if (now - v.firstAttempt > windowMs) {
        attempts.delete(k);
      }
    }

    const userAttempts = attempts.get(key);

    if (!userAttempts) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      const timeLeft = Math.ceil((windowMs - (now - userAttempts.firstAttempt)) / 1000 / 60);
      return res.status(429).json({
        error: `Too many login attempts. Try again in ${timeLeft} minutes.`,
        retryAfter: timeLeft
      });
    }

    userAttempts.count++;
    next();
  };
};

const clearRateLimit = (req, res, next) => {
  next();
};

module.exports = {
  authMiddleware,
  requireAuth,
  optionalAuth,
  guestOnly,
  verifyTokenOnly,
  authRateLimit,
  clearRateLimit
};
