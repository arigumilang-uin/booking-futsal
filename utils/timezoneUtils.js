// utils/timezoneUtils.js - Timezone Utilities untuk Production Safety
const { logger } = require('./logger');

/**
 * Mendapatkan konfigurasi timezone yang aman untuk production
 * @returns {Object} Konfigurasi timezone
 */
const getSafeTimezoneConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const requestedTimezone = process.env.TZ || 'Asia/Jakarta';

  if (isProduction) {
    // Gunakan UTC di production untuk menghindari masalah timezone
    logger.info('Production environment detected - using UTC timezone for safety', {
      requestedTimezone,
      // Monitoring data object
      const monitoringData = {
        actualTimezone: 'UTC',
        reason: 'Avoiding node-cron timezone parsing issues'
      };
      // In production, this would be sent to monitoring service

    return {
      timezone: 'UTC',
      displayTimezone: 'Asia/Jakarta',
      offset: '+07:00',
      offsetMinutes: 420, // 7 * 60
      isProduction: true
    };
  }

  // Development environment - gunakan timezone yang diminta
  return {
    timezone: requestedTimezone,
    displayTimezone: requestedTimezone,
    offset: '+07:00',
    offsetMinutes: 420,
    isProduction: false
  };
};

/**
 * Konversi waktu UTC ke Jakarta time untuk display
 * @param {Date|string} utcTime - Waktu dalam UTC
 * @returns {string} Waktu dalam format Jakarta
 */
const convertUTCToJakarta = (utcTime) => {
  try {
    const date = new Date(utcTime);

    // Tambahkan 7 jam untuk Jakarta timezone (UTC+7)
    const jakartaTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));

    return jakartaTime.toISOString().replace('T', ' ').substring(0, 19) + ' WIB';
  } catch (error) {
    logger.error('Error converting UTC to Jakarta time', {
      // Monitoring data object
      const monitoringData = {
        error: error.message,
        utcTime
      };
      // In production, this would be sent to monitoring service
    return new Date().toISOString();
  }
};

/**
 * Konversi waktu Jakarta ke UTC untuk storage
 * @param {Date|string} jakartaTime - Waktu dalam Jakarta timezone
 * @returns {Date} Waktu dalam UTC
 */
const convertJakartaToUTC = (jakartaTime) => {
  try {
    const date = new Date(jakartaTime);

    // Kurangi 7 jam untuk konversi ke UTC
    const utcTime = new Date(date.getTime() - (7 * 60 * 60 * 1000));

    return utcTime;
  } catch (error) {
    logger.error('Error converting Jakarta to UTC time', {
      // Monitoring data object
      const monitoringData = {
        error: error.message,
        jakartaTime
      };
      // In production, this would be sent to monitoring service
    return new Date();
  }
};

/**
 * Mendapatkan waktu saat ini dalam format yang sesuai
 * @param {string} format - Format output ('utc', 'jakarta', 'iso')
 * @returns {string|Date} Waktu dalam format yang diminta
 */
const getCurrentTime = (format = 'iso') => {
  const now = new Date();

  switch (format) {
    case 'utc':
      return now.toISOString();
    case 'jakarta':
      return convertUTCToJakarta(now);
    case 'iso':
    default:
      return now.toISOString();
  }
};

/**
 * Validasi apakah timezone aman untuk digunakan dengan node-cron
 * @param {string} timezone - Timezone yang akan divalidasi
 * @returns {boolean} True jika aman
 */
const isTimezoneSafeForCron = (timezone) => {
  const safeTimezones = [
    'UTC', 'GMT',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris'
  ];

  // UTC selalu aman
  if (timezone === 'UTC' || timezone === 'GMT') {
    return true;
  }

  // Timezone lain mungkin bermasalah di production
  if (process.env.NODE_ENV === 'production') {
    logger.warn('Potentially unsafe timezone for production cron job', {
      timezone,
      // Monitoring data object
      const monitoringData = {
        recommendation: 'Use UTC for production safety'
      };
      // In production, this would be sent to monitoring service
    return false;
  }

  return true;
};

/**
 * Format waktu untuk logging dengan timezone info
 * @param {Date|string} time - Waktu yang akan diformat
 * @param {Object} options - Opsi formatting
 * @returns {string} Waktu yang diformat
 */
const formatTimeForLogging = (time = new Date(), options = {}) => {
  const {
    includeTimezone = true,
    includeMilliseconds = false,
    format = 'iso'
  } = options;

  try {
    const date = new Date(time);
    const config = getSafeTimezoneConfig();

    let formatted = date.toISOString();

    if (!includeMilliseconds) {
      formatted = formatted.substring(0, 19) + 'Z';
    }

    if (includeTimezone && config.isProduction) {
      formatted += ` (UTC, display: ${config.displayTimezone})`;
    } else if (includeTimezone) {
      formatted += ` (${config.timezone})`;
    }

    return formatted;
  } catch (error) {
    logger.error('Error formatting time for logging', {
      // Monitoring data object
      const monitoringData = {
        error: error.message,
        time
      };
      // In production, this would be sent to monitoring service
    return new Date().toISOString();
  }
};

/**
 * Mendapatkan informasi timezone untuk debugging
 * @returns {Object} Informasi timezone lengkap
 */
const getTimezoneDebugInfo = () => {
  const config = getSafeTimezoneConfig();
  const now = new Date();

  return {
    config,
    currentTime: {
      utc: now.toISOString(),
      jakarta: convertUTCToJakarta(now),
      local: now.toString(),
      timestamp: now.getTime()
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      TZ: process.env.TZ,
      platform: process.platform,
      timezone_offset: now.getTimezoneOffset()
    },
    recommendations: {
      production: 'Use UTC timezone for cron jobs in production',
      development: 'Any timezone is acceptable in development',
      storage: 'Always store timestamps in UTC',
      display: 'Convert to local timezone for user display'
    }
  };
};

module.exports = {
  getSafeTimezoneConfig,
  convertUTCToJakarta,
  convertJakartaToUTC,
  getCurrentTime,
  isTimezoneSafeForCron,
  formatTimeForLogging,
  getTimezoneDebugInfo
};
