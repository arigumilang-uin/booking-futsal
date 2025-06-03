// config/envValidator.js - Validasi Environment Variables
const validator = require('validator');

/**
 * Daftar environment variables yang diperlukan untuk aplikasi
 */
const REQUIRED_ENV_VARS = {
  // Database Configuration
  DATABASE_URL: {
    required: true,
    type: 'string',
    description: 'URL koneksi database PostgreSQL',
    validator: (value) => {
      if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        throw new Error('DATABASE_URL harus berupa URL PostgreSQL yang valid');
      }
      return true;
    }
  },

  // JWT Configuration
  JWT_SECRET: {
    required: true,
    type: 'string',
    description: 'Secret key untuk JWT token',
    validator: (value) => {
      if (value.length < 32) {
        throw new Error('JWT_SECRET harus minimal 32 karakter untuk keamanan');
      }
      return true;
    }
  },

  // Server Configuration
  PORT: {
    required: false,
    type: 'number',
    default: 5000,
    description: 'Port server aplikasi',
    validator: (value) => {
      const port = parseInt(value);
      if (port < 1 || port > 65535) {
        throw new Error('PORT harus antara 1-65535');
      }
      return true;
    }
  },

  NODE_ENV: {
    required: false,
    type: 'string',
    default: 'development',
    description: 'Environment aplikasi',
    validator: (value) => {
      const validEnvs = ['development', 'production', 'test'];
      if (!validEnvs.includes(value)) {
        throw new Error(`NODE_ENV harus salah satu dari: ${validEnvs.join(', ')}`);
      }
      return true;
    }
  },

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: {
    required: false,
    type: 'number',
    default: 900000, // 15 minutes
    description: 'Window waktu rate limiting dalam milliseconds'
  },

  RATE_LIMIT_MAX_REQUESTS: {
    required: false,
    type: 'number',
    default: 100,
    description: 'Maksimal request per window'
  },

  // Auto-completion Configuration
  AUTO_COMPLETION_SCHEDULE: {
    required: false,
    type: 'string',
    default: '*/30 * * * *',
    description: 'Cron schedule untuk auto-completion'
  },

  ENABLE_AUTO_COMPLETION: {
    required: false,
    type: 'boolean',
    default: 'true',
    description: 'Enable/disable auto-completion cron job'
  },

  // Timezone Configuration
  TZ: {
    required: false,
    type: 'string',
    default: 'Asia/Jakarta',
    description: 'Timezone aplikasi'
  }
};

/**
 * Validasi environment variables
 */
const validateEnvironment = () => {
  console.log('🔍 Memvalidasi environment variables...');
  
  const errors = [];
  const warnings = [];
  const config = {};

  // Validasi setiap environment variable
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, settings]) => {
    const value = process.env[key];
    
    try {
      // Cek apakah required variable ada
      if (settings.required && !value) {
        errors.push(`❌ ${key} diperlukan tetapi tidak ditemukan`);
        return;
      }

      // Gunakan default value jika tidak ada
      const finalValue = value || settings.default;
      
      if (!finalValue && settings.required) {
        errors.push(`❌ ${key} diperlukan tetapi tidak ada nilai default`);
        return;
      }

      // Konversi tipe data
      let processedValue = finalValue;
      if (settings.type === 'number' && typeof finalValue === 'string') {
        processedValue = parseInt(finalValue);
        if (isNaN(processedValue)) {
          errors.push(`❌ ${key} harus berupa angka, diterima: ${finalValue}`);
          return;
        }
      } else if (settings.type === 'boolean' && typeof finalValue === 'string') {
        processedValue = finalValue.toLowerCase() === 'true';
      }

      // Jalankan validator custom jika ada
      if (settings.validator && finalValue) {
        try {
          settings.validator(finalValue);
        } catch (validationError) {
          errors.push(`❌ ${key}: ${validationError.message}`);
          return;
        }
      }

      // Simpan ke config
      config[key] = processedValue;

      // Warning jika menggunakan default value
      if (!value && settings.default) {
        warnings.push(`⚠️  ${key} menggunakan nilai default: ${settings.default}`);
      }

    } catch (error) {
      errors.push(`❌ Error validasi ${key}: ${error.message}`);
    }
  });

  // Tampilkan hasil validasi
  if (errors.length > 0) {
    console.error('\n🚨 ERROR: Environment variables tidak valid:');
    errors.forEach(error => console.error(`  ${error}`));
    console.error('\n📋 Environment variables yang diperlukan:');
    Object.entries(REQUIRED_ENV_VARS).forEach(([key, settings]) => {
      const status = settings.required ? '[REQUIRED]' : '[OPTIONAL]';
      console.error(`  ${status} ${key}: ${settings.description}`);
    });
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  PERINGATAN:');
    warnings.forEach(warning => console.warn(`  ${warning}`));
  }

  console.log('✅ Semua environment variables valid');
  return config;
};

/**
 * Tampilkan konfigurasi environment (tanpa sensitive data)
 */
const displayConfig = (config) => {
  console.log('\n📋 Konfigurasi Environment:');
  Object.entries(config).forEach(([key, value]) => {
    // Sembunyikan sensitive data
    const sensitiveKeys = ['JWT_SECRET', 'DATABASE_URL'];
    const displayValue = sensitiveKeys.includes(key) 
      ? '***HIDDEN***' 
      : value;
    console.log(`  ${key}: ${displayValue}`);
  });
};

module.exports = {
  validateEnvironment,
  displayConfig,
  REQUIRED_ENV_VARS
};
