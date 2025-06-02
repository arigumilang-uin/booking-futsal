const pool = require('../../config/db');
const crypto = require('crypto');

// Generate secure random token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create password reset token
const createPasswordResetToken = async (email) => {
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  const query = `
    INSERT INTO password_resets (email, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, uuid, email, token, expires_at, created_at
  `;
  
  const values = [email, token, expiresAt];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get password reset by token
const getPasswordResetByToken = async (token) => {
  const query = `
    SELECT pr.id, pr.uuid, pr.email, pr.token, pr.expires_at, pr.used_at, pr.created_at,
           u.id as user_id, u.name as user_name
    FROM password_resets pr
    JOIN users u ON pr.email = u.email
    WHERE pr.token = $1 AND pr.used_at IS NULL
  `;
  
  const result = await pool.query(query, [token]);
  return result.rows[0];
};

// Validate password reset token
const validatePasswordResetToken = async (token) => {
  const resetData = await getPasswordResetByToken(token);
  
  if (!resetData) {
    return { valid: false, error: 'Token tidak ditemukan atau sudah digunakan' };
  }
  
  const now = new Date();
  const expiresAt = new Date(resetData.expires_at);
  
  if (now > expiresAt) {
    return { valid: false, error: 'Token sudah expired' };
  }
  
  return { valid: true, data: resetData };
};

// Mark password reset token as used
const markPasswordResetAsUsed = async (token) => {
  const query = `
    UPDATE password_resets 
    SET used_at = NOW(), updated_at = NOW()
    WHERE token = $1 AND used_at IS NULL
    RETURNING id, email, used_at
  `;
  
  const result = await pool.query(query, [token]);
  return result.rows[0];
};

// Clean up expired tokens (for maintenance)
const cleanupExpiredTokens = async () => {
  const query = `
    DELETE FROM password_resets 
    WHERE expires_at < NOW() OR used_at IS NOT NULL
    RETURNING count(*)
  `;
  
  const result = await pool.query(query);
  return result.rowCount;
};

// Get all password reset attempts for a user (for security monitoring)
const getPasswordResetHistory = async (email, limit = 10) => {
  const query = `
    SELECT id, uuid, email, expires_at, used_at, created_at
    FROM password_resets
    WHERE email = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [email, limit]);
  return result.rows;
};

// Check if user has recent password reset attempts (rate limiting)
const checkRecentPasswordResetAttempts = async (email, minutesAgo = 5) => {
  const timeThreshold = new Date(Date.now() - minutesAgo * 60 * 1000);
  
  const query = `
    SELECT COUNT(*) as attempt_count
    FROM password_resets
    WHERE email = $1 AND created_at > $2
  `;
  
  const result = await pool.query(query, [email, timeThreshold]);
  const attemptCount = parseInt(result.rows[0].attempt_count);
  
  return {
    hasRecentAttempts: attemptCount > 0,
    attemptCount,
    canRequest: attemptCount < 3 // Max 3 attempts per 5 minutes
  };
};

module.exports = {
  generateResetToken,
  createPasswordResetToken,
  getPasswordResetByToken,
  validatePasswordResetToken,
  markPasswordResetAsUsed,
  cleanupExpiredTokens,
  getPasswordResetHistory,
  checkRecentPasswordResetAttempts
};
