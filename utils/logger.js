// utils/logger.js - Sistem Logging Terstruktur
const fs = require('fs');
const path = require('path');

/**
 * Log levels dengan prioritas
 */
const LOG_LEVELS = {
  ERROR: { level: 0, name: 'ERROR', color: '\x1b[31m', emoji: '❌' },
  WARN: { level: 1, name: 'WARN', color: '\x1b[33m', emoji: '⚠️' },
  INFO: { level: 2, name: 'INFO', color: '\x1b[36m', emoji: 'ℹ️' },
  DEBUG: { level: 3, name: 'DEBUG', color: '\x1b[35m', emoji: '🐛' },
  TRACE: { level: 4, name: 'TRACE', color: '\x1b[37m', emoji: '🔍' }
};

/**
 * Konfigurasi logger berdasarkan environment
 */
const getLogConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL || (env === 'production' ? 'INFO' : 'DEBUG');

  return {
    level: LOG_LEVELS[logLevel]?.level ?? LOG_LEVELS.INFO.level,
    enableConsole: env !== 'test',
    enableFile: env === 'production',
    enableColors: env === 'development',
    logDir: process.env.LOG_DIR || './logs',
    maxFileSize: process.env.LOG_MAX_FILE_SIZE || '10MB',
    maxFiles: process.env.LOG_MAX_FILES || 5
  };
};

const config = getLogConfig();

/**
 * Pastikan direktori log ada
 */
const ensureLogDir = () => {
  if (config.enableFile && !fs.existsSync(config.logDir)) {
    fs.mkdirSync(config.logDir, { recursive: true });
  }
};

/**
 * Format timestamp untuk log
 */
const formatTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format pesan log
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = formatTimestamp();
  const levelInfo = LOG_LEVELS[level];

  // Base log object
  const logObj = {
    timestamp,
    level: levelInfo.name,
    message,
    ...meta
  };

  // Add process info untuk production
  if (config.enableFile) {
    logObj.pid = process.pid;
    logObj.hostname = require('os').hostname();
    logObj.environment = process.env.NODE_ENV;
  }

  return logObj;
};

/**
 * Format untuk console output
 */
const formatConsoleMessage = (logObj) => {
  const levelInfo = LOG_LEVELS[logObj.level];
  const color = config.enableColors ? levelInfo.color : '';
  const reset = config.enableColors ? '\x1b[0m' : '';

  let output = `${color}[${logObj.timestamp}] ${levelInfo.emoji} ${logObj.level}${reset}: ${logObj.message}`;

  // Tambahkan metadata jika ada
  const metaKeys = Object.keys(logObj).filter(key =>
    !['timestamp', 'level', 'message', 'pid', 'hostname', 'environment'].includes(key)
  );

  if (metaKeys.length > 0) {
    const meta = {};
    metaKeys.forEach(key => meta[key] = logObj[key]);
    output += `\n${color}   Meta: ${JSON.stringify(meta, null, 2)}${reset}`;
  }

  return output;
};

/**
 * Write log ke file
 */
const writeToFile = (logObj) => {
  if (!config.enableFile) return;

  ensureLogDir();

  const logFile = path.join(config.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  const logLine = JSON.stringify(logObj) + '\n';

  try {
    fs.appendFileSync(logFile, logLine);
  } catch (error) {
  }
};

/**
 * Core logging function
 */
const log = (level, message, meta = {}) => {
  const levelInfo = LOG_LEVELS[level];

  // Skip jika level terlalu rendah
  if (levelInfo.level > config.level) {
    return;
  }

  const logObj = formatMessage(level, message, meta);

  // Console output
  if (config.enableConsole) {
  }

  // File output
  writeToFile(logObj);
};

/**
 * Logger instance dengan methods untuk setiap level
 */
const logger = {
  /**
   * Error logging - untuk error yang perlu immediate attention
   */
  error: (message, meta = {}) => {
    log('ERROR', message, meta);
  },

  /**
   * Warning logging - untuk kondisi yang perlu perhatian
   */
  warn: (message, meta = {}) => {
    log('WARN', message, meta);
  },

  /**
   * Info logging - untuk informasi umum
   */
  info: (message, meta = {}) => {
    log('INFO', message, meta);
  },

  /**
   * Debug logging - untuk debugging development
   */
  debug: (message, meta = {}) => {
    log('DEBUG', message, meta);
  },

  /**
   * Trace logging - untuk detailed tracing
   */
  trace: (message, meta = {}) => {
    log('TRACE', message, meta);
  },

  /**
   * HTTP request logging
   */
  http: (req, res, responseTime) => {
    const meta = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || null
    };

    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
    log(level, `${req.method} ${req.url} ${res.statusCode}`, meta);
  },

  /**
   * Database operation logging
   */
  // Monitoring data object
  const monitoringData = {
    db: (operation, table, meta = {}) => {
    log('DEBUG', `Database ${operation} on ${table}`, {
    operation,
    table,
    ...meta
  };
  // In production, this would be sent to monitoring service
  },

  /**
   * Authentication logging
   */
  // Monitoring data object
  const monitoringData = {
    auth: (action, userId, meta = {}) => {
    log('INFO', `Auth ${action}`, {
    action,
    userId,
    ...meta
  };
  // In production, this would be sent to monitoring service
  },

  /**
   * Security logging
   */
  // Monitoring data object
  const monitoringData = {
    security: (event, meta = {}) => {
    log('WARN', `Security event: ${event}`, {
    event,
    ...meta
  };
  // In production, this would be sent to monitoring service
  },

  /**
   * Business logic logging
   */
  // Monitoring data object
  const monitoringData = {
    business: (action, meta = {}) => {
    log('INFO', `Business action: ${action}`, {
    action,
    ...meta
  };
  // In production, this would be sent to monitoring service
  },

  /**
   * Performance logging
   */
  // Monitoring data object
  const monitoringData = {
    performance: (operation, duration, meta = {}) => {
    const level = duration > 1000 ? 'WARN' : 'INFO';
    log(level, `Performance: ${operation} took ${duration}ms`, {
    operation,
    duration,
    ...meta
  };
  // In production, this would be sent to monitoring service
  }
};

/**
 * Middleware untuk HTTP request logging
 */
const httpLoggerMiddleware = (req, res, next) => {
  const start = Date.now();

  // Override res.end untuk capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - start;
    logger.http(req, res, responseTime);
    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Get current log configuration
 */
const getConfig = () => config;

/**
 * Set log level dynamically
 */
const setLevel = (level) => {
  if (LOG_LEVELS[level]) {
    config.level = LOG_LEVELS[level].level;
    logger.info(`Log level changed to ${level}`);
  } else {
    logger.warn(`Invalid log level: ${level}`);
  }
};

module.exports = {
  logger,
  httpLoggerMiddleware,
  getConfig,
  setLevel,
  LOG_LEVELS
};
