const {
  getAllSettings,
  getPublicSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
  initializeDefaultSettings,
  getSettingsByCategory,
  bulkUpdateSettings
} = require('../../models/system/systemSettingsModel');

// Get all system settings (admin only)
const getAllSystemSettings = async (req, res) => {
  try {
    const settings = await getAllSettings();

    res.json({
      success: true,
      data: {
        settings,
        total: settings.length
      }
    });
  } catch (error) {
    console.error('Get all settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil pengaturan sistem'
    });
  }
};

// Get public settings (accessible by all)
const getPublicSystemSettings = async (req, res) => {
  try {
    const settings = await getPublicSettings();

    res.json({
      success: true,
      data: {
        settings,
        total: settings.length
      }
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil pengaturan publik'
    });
  }
};

// Get setting by key
const getSystemSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await getSettingByKey(key);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Pengaturan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil pengaturan'
    });
  }
};

// Create or update setting
const updateSystemSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, is_public } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nilai pengaturan diperlukan'
      });
    }

    const setting = await upsertSetting({
      key,
      value,
      description,
      is_public
    });

    res.json({
      success: true,
      message: 'Pengaturan berhasil diperbarui',
      data: setting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui pengaturan'
    });
  }
};

// Create new setting
const createSystemSetting = async (req, res) => {
  try {
    const { key, value, description, is_public } = req.body;

    console.log('Create setting request:', { key, value, description, is_public });

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Key dan value pengaturan diperlukan'
      });
    }

    // Check if setting already exists
    const existing = await getSettingByKey(key);
    console.log('Existing setting check:', existing);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Pengaturan dengan key ini sudah ada'
      });
    }

    console.log('Calling upsertSetting with:', {
      key,
      value,
      description,
      is_public: is_public || false
    });

    const setting = await upsertSetting({
      key,
      value,
      description,
      is_public: is_public || false
    });

    console.log('Setting created:', setting);

    res.status(201).json({
      success: true,
      message: 'Pengaturan berhasil dibuat',
      data: setting
    });
  } catch (error) {
    console.error('Create setting error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat pengaturan',
      error: error.message
    });
  }
};

// Delete setting
const deleteSystemSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const deleted = await deleteSetting(key);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Pengaturan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Pengaturan berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus pengaturan'
    });
  }
};

// Get settings by category
const getSettingsByCategoryController = async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await getSettingsByCategory(category);

    res.json({
      success: true,
      data: {
        category,
        settings,
        total: settings.length
      }
    });
  } catch (error) {
    console.error('Get settings by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil pengaturan kategori'
    });
  }
};

// Bulk update settings
const bulkUpdateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array pengaturan diperlukan'
      });
    }

    // Validate settings format
    for (const setting of settings) {
      if (!setting.key || setting.value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Setiap pengaturan harus memiliki key dan value'
        });
      }
    }

    const updatedSettings = await bulkUpdateSettings(settings);

    res.json({
      success: true,
      message: `${updatedSettings.length} pengaturan berhasil diperbarui`,
      data: {
        updated_settings: updatedSettings,
        total_updated: updatedSettings.length
      }
    });
  } catch (error) {
    console.error('Bulk update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui pengaturan secara massal'
    });
  }
};

// Initialize default settings
const initializeDefaults = async (req, res) => {
  try {
    const defaultSettings = await initializeDefaultSettings();

    res.json({
      success: true,
      message: 'Pengaturan default berhasil diinisialisasi',
      data: {
        initialized_settings: defaultSettings,
        total: defaultSettings.length
      }
    });
  } catch (error) {
    console.error('Initialize defaults error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menginisialisasi pengaturan default'
    });
  }
};

// Get app configuration (public endpoint)
const getApplicationConfig = async (req, res) => {
  try {
    const config = {
      app_name: 'Enhanced Futsal Booking System',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production'
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get app config error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil konfigurasi aplikasi'
    });
  }
};

// Reset setting to default
const resetSettingToDefault = async (req, res) => {
  try {
    const { key } = req.params;

    // Define default values for common settings
    const defaults = {
      'booking_advance_days': 30,
      'booking_cancellation_hours': 24,
      'payment_timeout_minutes': 60,
      'admin_fee_percentage': 5,
      'notification_email_enabled': true,
      'maintenance_mode': false
    };

    if (!defaults.hasOwnProperty(key)) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada nilai default untuk pengaturan ini'
      });
    }

    const setting = await upsertSetting({
      key,
      value: defaults[key],
      description: null,
      is_public: true
    });

    res.json({
      success: true,
      message: 'Pengaturan berhasil direset ke default',
      data: setting
    });
  } catch (error) {
    console.error('Reset setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mereset pengaturan'
    });
  }
};

module.exports = {
  getAllSystemSettings,
  getPublicSystemSettings,
  getSystemSetting,
  updateSystemSetting,
  createSystemSetting,
  deleteSystemSetting,
  getSettingsByCategory: getSettingsByCategoryController,
  bulkUpdateSystemSettings,
  initializeDefaults,
  getApplicationConfig,
  resetSettingToDefault
};
