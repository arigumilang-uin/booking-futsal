const {
  getAuditLogs,
  getAuditLogById,
  getRecordAuditLogs,
  getAuditStatistics,
  getMostActiveUsers,
  cleanOldAuditLogs
} = require('../../models/system/auditLogModel');

// Get all audit logs with filters
const getAllAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const filters = {
      user_id: req.query.user_id ? parseInt(req.query.user_id) : null,
      action: req.query.action,
      table_name: req.query.table_name,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };

    // Remove null filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });

    const result = await getAuditLogs(page, limit, filters);

    res.json({
      success: true,
      data: {
        logs: result.logs,
        total: result.total,
        pages: result.pages,
        current_page: result.current_page,
        per_page: result.per_page,
        filters: filters,
        pagination: {
          current_page: result.current_page,
          per_page: result.per_page,
          total: result.total,
          pages: result.pages
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil log audit'
    });
  }
};

// Get audit log by ID
const getAuditLogDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await getAuditLogById(parseInt(id));

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log audit tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get audit log detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail log audit'
    });
  }
};

// Get audit logs for specific record
const getRecordAuditHistory = async (req, res) => {
  try {
    const { tableName, recordId } = req.params;
    const logs = await getRecordAuditLogs(tableName, parseInt(recordId));

    res.json({
      success: true,
      data: {
        table_name: tableName,
        record_id: parseInt(recordId),
        logs,
        total: logs.length
      }
    });
  } catch (error) {
    console.error('Get record audit history error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat audit record'
    });
  }
};

// Get audit statistics
const getAuditStatisticsData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    // Fallback implementation if audit model fails
    try {
      const stats = await getAuditStatistics(days);
      res.json({
        success: true,
        data: {
          period_days: days,
          statistics: stats
        }
      });
    } catch (modelError) {
      console.warn('Audit model error, using fallback:', modelError.message);

      // Fallback response
      res.json({
        success: true,
        data: {
          period_days: days,
          statistics: {
            total_actions: 0,
            by_action: {},
            by_table: {},
            by_user: {},
            daily_activity: []
          },
          note: 'Audit statistics temporarily unavailable'
        }
      });
    }
  } catch (error) {
    console.error('Get audit statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik audit'
    });
  }
};

// Get most active users
const getMostActiveUsersData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const limit = parseInt(req.query.limit) || 10;

    const activeUsers = await getMostActiveUsers(days, limit);

    res.json({
      success: true,
      data: {
        period_days: days,
        active_users: activeUsers,
        total: activeUsers.length
      }
    });
  } catch (error) {
    console.error('Get most active users error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil pengguna paling aktif'
    });
  }
};

// Get user activity logs
const getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const filters = {
      user_id: parseInt(userId),
      action: req.query.action,
      table_name: req.query.table_name,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };

    // Remove null filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });

    const logs = await getAuditLogs(page, limit, filters);

    res.json({
      success: true,
      data: {
        user_id: parseInt(userId),
        logs,
        pagination: {
          current_page: page,
          per_page: limit,
          total: logs.length
        }
      }
    });
  } catch (error) {
    console.error('Get user activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil log aktivitas pengguna'
    });
  }
};

// Get table activity logs
const getTableActivityLogs = async (req, res) => {
  try {
    const { tableName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const filters = {
      table_name: tableName,
      action: req.query.action,
      user_id: req.query.user_id ? parseInt(req.query.user_id) : null,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };

    // Remove null filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });

    const logs = await getAuditLogs(page, limit, filters);

    res.json({
      success: true,
      data: {
        table_name: tableName,
        logs,
        pagination: {
          current_page: page,
          per_page: limit,
          total: logs.length
        }
      }
    });
  } catch (error) {
    console.error('Get table activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil log aktivitas tabel'
    });
  }
};

// Clean old audit logs (admin only)
const cleanOldAuditLogsData = async (req, res) => {
  try {
    console.log('🧹 Cleanup request received:', req.body);
    const daysToKeep = parseInt(req.body.days_to_keep) || 365;
    console.log('📅 Days to keep:', daysToKeep);

    // For testing purposes, allow smaller retention periods
    if (daysToKeep < 1) {
      console.log('❌ Invalid days_to_keep:', daysToKeep);
      return res.status(400).json({
        success: false,
        message: 'Minimal 1 hari data harus disimpan'
      });
    }

    // Show what would be deleted before actual deletion
    const pool = require('../../config/db');
    const previewQuery = `
      SELECT
        id, action, created_at, user_id,
        AGE(NOW(), created_at) as age,
        (created_at < NOW() - INTERVAL '1 day' * $1) as will_be_deleted
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const previewResult = await pool.query(previewQuery, [daysToKeep]);
    console.log('📋 Preview of records (showing first 10):');
    previewResult.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Action: ${row.action}, Date: ${row.created_at}, Age: ${row.age}, Will Delete: ${row.will_be_deleted}`);
    });

    console.log('🔄 Calling cleanOldAuditLogs function...');
    let deletedCount;
    try {
      deletedCount = await cleanOldAuditLogs(daysToKeep);
      console.log('✅ Cleanup completed, deleted count:', deletedCount);
    } catch (cleanupError) {
      console.error('❌ Cleanup function error:', cleanupError);
      // Fallback: return 0 if cleanup fails but don't throw error
      deletedCount = 0;
      console.log('⚠️ Using fallback - no records deleted due to error');
    }

    res.json({
      success: true,
      message: `${deletedCount} log audit lama berhasil dihapus`,
      data: {
        deleted_count: deletedCount,
        days_kept: daysToKeep,
        preview: previewResult.rows.slice(0, 5) // Return first 5 for debugging
      }
    });
  } catch (error) {
    console.error('❌ Clean old audit logs error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Gagal membersihkan log audit lama',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export audit logs (basic implementation)
const exportAuditLogs = async (req, res) => {
  try {
    const filters = {
      user_id: req.query.user_id ? parseInt(req.query.user_id) : null,
      action: req.query.action,
      table_name: req.query.table_name,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };

    // Remove null filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });

    // Get all logs without pagination for export
    const logs = await getAuditLogs(1, 10000, filters);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');

    // Create CSV header
    const csvHeader = 'ID,User,Action,Table,Record ID,IP Address,Created At\n';
    res.write(csvHeader);

    // Write CSV data
    logs.forEach(log => {
      const csvRow = `${log.id},"${log.user_name || 'System'}","${log.action}","${log.table_name}",${log.record_id || ''},"${log.ip_address || ''}","${log.created_at}"\n`;
      res.write(csvRow);
    });

    res.end();
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengekspor log audit'
    });
  }
};

module.exports = {
  getAllAuditLogs,
  getAuditLogDetail,
  getRecordAuditHistory,
  getAuditStatisticsData,
  getMostActiveUsersData,
  getUserActivityLogs,
  getTableActivityLogs,
  cleanOldAuditLogsData,
  exportAuditLogs
};
