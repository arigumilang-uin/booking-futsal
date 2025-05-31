const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (payload, expiresIn = '7d') => {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomBytes(16).toString('hex')
    };

    const token = jwt.sign(
      tokenPayload,
      secret,
      {
        expiresIn,
        issuer: 'futsal-booking-api',
        audience: 'futsal-booking-client',
        algorithm: 'HS256'
      }
    );

    return token;
  } catch (error) {
    console.error('Generate token error:', error);
    throw new Error('Failed to generate token');
  }
};

const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const decoded = jwt.verify(token, secret, {
      issuer: 'futsal-booking-api',
      audience: 'futsal-booking-client',
      algorithms: ['HS256']
    });

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      console.error('Verify token error:', error);
      throw new Error('Token verification failed');
    }
  }
};

const extractTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.token;
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  return cookieToken || headerToken || null;
};

const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    console.error('Get token expiration error:', error);
    return null;
  }
};

const isTokenExpired = (token) => {
  try {
    const expiration = getTokenExpiration(token);
    return expiration ? new Date() > expiration : true;
  } catch (error) {
    console.error('Check token expiration error:', error);
    return true;
  }
};

const generateRefreshToken = (payload) => {
  try {
    const secret = process.env.JWT_SECRET + '_refresh';

    const refreshPayload = {
      id: payload.id,
      email: payload.email,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomBytes(16).toString('hex')
    };

    return jwt.sign(
      refreshPayload,
      secret,
      {
        expiresIn: '30d',
        issuer: 'futsal-booking-api',
        audience: 'futsal-booking-client'
      }
    );
  } catch (error) {
    console.error('Generate refresh token error:', error);
    throw new Error('Failed to generate refresh token');
  }
};

const verifyRefreshToken = (refreshToken) => {
  try {
    const secret = process.env.JWT_SECRET + '_refresh';

    const decoded = jwt.verify(refreshToken, secret, {
      issuer: 'futsal-booking-api',
      audience: 'futsal-booking-client'
    });

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      console.error('Verify refresh token error:', error);
      throw new Error('Refresh token verification failed');
    }
  }
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromRequest,
  getTokenExpiration,
  isTokenExpired,
  generateRefreshToken,
  verifyRefreshToken
};
