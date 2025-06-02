const pool = require('../../config/db');

// Get all system settings
const getAllSettings = async () => {
  const query = `
    SELECT id, uuid, key, value, description, category, data_type,
           is_public, created_at, updated_at
    FROM system_settings
    ORDER BY category, key
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get setting by key
const getSettingByKey = async (key) => {
  const query = `
    SELECT id, uuid, key, value, description, category, data_type,
           is_public, created_at, updated_at
    FROM system_settings
    WHERE key = $1
  `;
  const result = await pool.query(query, [key]);
  return result.rows[0];
};

// Get settings by category
const getSettingsByCategory = async (category) => {
  const query = `
    SELECT id, uuid, key, value, description, category, data_type,
           is_public, created_at, updated_at
    FROM system_settings
    WHERE category = $1
    ORDER BY key
  `;
  const result = await pool.query(query, [category]);
  return result.rows;
};

// Get public settings (for frontend)
const getPublicSettings = async () => {
  const query = `
    SELECT key, value, category, data_type
    FROM system_settings
    WHERE is_public = true
    ORDER BY category, key
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Create or update setting
const upsertSetting = async ({
  key,
  value,
  description = '',
  category = 'general',
  data_type = 'string',
  is_public = false
}) => {
  // Convert value to JSON format for JSONB column
  const jsonValue = JSON.stringify({
    value: value,
    type: data_type
  });

  const query = `
    INSERT INTO system_settings (key, value, description, category, data_type, is_public)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (key)
    DO UPDATE SET
      value = EXCLUDED.value,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      data_type = EXCLUDED.data_type,
      is_public = EXCLUDED.is_public,
      updated_at = NOW()
    RETURNING id, uuid, key, value, description, category, data_type,
              is_public, created_at, updated_at
  `;
  const values = [key, jsonValue, description, category, data_type, is_public];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Update setting value
const updateSettingValue = async (key, value) => {
  const query = `
    UPDATE system_settings
    SET value = $1, updated_at = NOW()
    WHERE key = $2
    RETURNING id, uuid, key, value, description, category, data_type,
              is_public, created_at, updated_at
  `;
  const result = await pool.query(query, [value, key]);
  return result.rows[0];
};

// Delete setting
const deleteSetting = async (key) => {
  const query = `
    DELETE FROM system_settings
    WHERE key = $1
    RETURNING id, key
  `;
  const result = await pool.query(query, [key]);
  return result.rowCount > 0;
};

// Get setting value with type conversion
const getSettingValue = async (key, defaultValue = null) => {
  const setting = await getSettingByKey(key);

  if (!setting) {
    return defaultValue;
  }

  const { value, data_type } = setting;

  switch (data_type) {
    case 'boolean':
      return value === 'true' || value === true;
    case 'number':
      return parseFloat(value);
    case 'integer':
      return parseInt(value);
    case 'json':
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error('Error parsing JSON setting:', key, error);
        return defaultValue;
      }
    case 'array':
      try {
        return JSON.parse(value);
      } catch (error) {
        return value.split(',').map(item => item.trim());
      }
    default:
      return value;
  }
};

// Set setting value with type handling
const setSettingValue = async (key, value, dataType = 'string') => {
  let stringValue = value;

  if (dataType === 'json' || dataType === 'array') {
    stringValue = JSON.stringify(value);
  } else if (dataType === 'boolean') {
    stringValue = value.toString();
  } else if (dataType === 'number' || dataType === 'integer') {
    stringValue = value.toString();
  }

  return await updateSettingValue(key, stringValue);
};

// Initialize default settings
const initializeDefaultSettings = async () => {
  const defaultSettings = [
    {
      key: 'site_name',
      value: 'Enhanced Futsal Booking System',
      description: 'Name of the application',
      category: 'general',
      data_type: 'string',
      is_public: true
    },
    {
      key: 'site_description',
      value: 'Professional futsal field booking system',
      description: 'Description of the application',
      category: 'general',
      data_type: 'string',
      is_public: true
    },
    {
      key: 'booking_advance_days',
      value: '30',
      description: 'Maximum days in advance for booking',
      category: 'booking',
      data_type: 'integer',
      is_public: true
    },
    {
      key: 'booking_cancellation_hours',
      value: '24',
      description: 'Minimum hours before booking for cancellation',
      category: 'booking',
      data_type: 'integer',
      is_public: true
    },
    {
      key: 'default_booking_duration',
      value: '60',
      description: 'Default booking duration in minutes',
      category: 'booking',
      data_type: 'integer',
      is_public: true
    },
    {
      key: 'admin_fee_percentage',
      value: '5',
      description: 'Admin fee percentage',
      category: 'payment',
      data_type: 'number',
      is_public: false
    },
    {
      key: 'payment_methods',
      value: '["cash", "transfer", "ewallet"]',
      description: 'Available payment methods',
      category: 'payment',
      data_type: 'array',
      is_public: true
    },
    {
      key: 'notification_enabled',
      value: 'true',
      description: 'Enable notification system',
      category: 'notification',
      data_type: 'boolean',
      is_public: false
    },
    {
      key: 'email_notifications',
      value: 'true',
      description: 'Enable email notifications',
      category: 'notification',
      data_type: 'boolean',
      is_public: false
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      description: 'Enable maintenance mode',
      category: 'system',
      data_type: 'boolean',
      is_public: true
    }
  ];

  const results = [];
  for (const setting of defaultSettings) {
    const result = await upsertSetting(setting);
    results.push(result);
  }

  return results;
};

// Get settings as key-value object
const getSettingsObject = async (category = null) => {
  let settings;

  if (category) {
    settings = await getSettingsByCategory(category);
  } else {
    settings = await getAllSettings();
  }

  const settingsObject = {};

  for (const setting of settings) {
    const value = await getSettingValue(setting.key);
    settingsObject[setting.key] = value;
  }

  return settingsObject;
};

// Bulk update settings
const bulkUpdateSettings = async (settingsData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const results = [];

    for (const [key, value] of Object.entries(settingsData)) {
      const setting = await getSettingByKey(key);
      if (setting) {
        const result = await setSettingValue(key, value, setting.data_type);
        results.push(result);
      }
    }

    await client.query('COMMIT');
    return results;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllSettings,
  getSettingByKey,
  getSettingsByCategory,
  getPublicSettings,
  upsertSetting,
  updateSettingValue,
  deleteSetting,
  getSettingValue,
  setSettingValue,
  initializeDefaultSettings,
  getSettingsObject,
  bulkUpdateSettings
};
