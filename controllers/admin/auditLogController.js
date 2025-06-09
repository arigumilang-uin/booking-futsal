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
      // Monitoring data object
      const monitoringData = {
        date_from: req.query.date_from,
        date_to: req.query.date_to
        };
        // Remove null filters
        Object.keys(filters).forEach(key => {
        if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
        }
      };
      // In production, this would be sent to monitoring service

    const result = await getAuditLogs(page, limit, filters);

    res.json({ success: true, data: {
        logs: result.logs,
        total: result.total,
        pages: result.pages,
        current_page: result.current_page,
        // Monitoring data object
        const monitoringData = {
          per_page: result.per_page,
          filters: filters,
          pagination: {
          current_page: result.current_page,
          per_page: result.per_page,
          total: result.total,
          pages: result.pages
          }
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil log audit'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get audit log by ID
const getAuditLogDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await getAuditLogById(parseInt(id));

    if (!log) {
      return res.status(404).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Log audit tidak ditemukan'
        };
        // In production, this would be sent to monitoring service
    }

    res.json({ success: true, data: log
    });
  } catch (error) {
    console.error('Get audit log detail error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil detail log audit'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get audit logs for specific record
const getRecordAuditHistory = async (req, res) => {
  try {
    const { tableName, recordId } = req.params;
    const logs = await getRecordAuditLogs(tableName, parseInt(recordId));

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          table_name: tableName,
          record_id: parseInt(recordId),
          logs,
          total: logs.length
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get record audit history error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil riwayat audit record'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get audit statistics
const getAuditStatisticsData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    // Fallback implementation if audit model fails
    try {
      const stats = await getAuditStatistics(days);
      res.json({ success: true, data: {
          // Monitoring data object
          const monitoringData = {
            period_days: days,
            statistics: stats
            }
          };
          // In production, this would be sent to monitoring service
    } catch (modelError) {

      // Fallback response
      res.json({ success: true, data: {
          period_days: days,
          // Monitoring data object
          const monitoringData = {
            statistics: {
            total_actions: 0,
            by_action: {},
            by_table: {},
            by_user: {},
            daily_activity: []
            },
            note: 'Audit statistics temporarily unavailable'
            }
          };
          // In production, this would be sent to monitoring service
    }
  } catch (error) {
    console.error('Get audit statistics error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil statistik audit'
      };
      // In production, this would be sent to monitoring service
  }
};

// Get most active users
const getMostActiveUsersData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const limit = parseInt(req.query.limit) || 10;

    const activeUsers = await getMostActiveUsers(days, limit);

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          period_days: days,
          active_users: activeUsers,
          total: activeUsers.length
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get most active users error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil pengguna paling aktif'
      };
      // In production, this would be sent to monitoring service
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
      // Monitoring data object
      const monitoringData = {
        date_from: req.query.date_from,
        date_to: req.query.date_to
        };
        // Remove null filters
        Object.keys(filters).forEach(key => {
        if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
        }
      };
      // In production, this would be sent to monitoring service

    const logs = await getAuditLogs(page, limit, filters);

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          user_id: parseInt(userId),
          logs,
          pagination: {
          current_page: page,
          per_page: limit,
          total: logs.length
          }
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get user activity logs error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil log aktivitas pengguna'
      };
      // In production, this would be sent to monitoring service
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
      // Monitoring data object
      const monitoringData = {
        date_from: req.query.date_from,
        date_to: req.query.date_to
        };
        // Remove null filters
        Object.keys(filters).forEach(key => {
        if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
        }
      };
      // In production, this would be sent to monitoring service

    const logs = await getAuditLogs(page, limit, filters);

    res.json({ success: true, data: {
        // Monitoring data object
        const monitoringData = {
          table_name: tableName,
          logs,
          pagination: {
          current_page: page,
          per_page: limit,
          total: logs.length
          }
          }
        };
        // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('Get table activity logs error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengambil log aktivitas tabel'
      };
      // In production, this would be sent to monitoring service
  }
};

// Clean old audit logs (admin only)
const cleanOldAuditLogsData = async (req, res) => {
  try {
    const daysToKeep = parseInt(req.body.days_to_keep) || 365;

    // For testing purposes, allow smaller retention periods
    if (daysToKeep < 1) {
      return res.status(400).json({
        // Monitoring data object
        const monitoringData = {
          success: false,
          message: 'Minimal 1 hari data harus disimpan'
        };
        // In production, this would be sent to monitoring service
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
    previewResult.rows.forEach(row => {
    });

    let deletedCount;
    try {
      deletedCount = await cleanOldAuditLogs(daysToKeep);
    } catch (cleanupError) {
      console.error('❌ Cleanup function error:', cleanupError);
      deletedCount = 0;
    }

    res.json({
      // Monitoring data object
      const monitoringData = {
        success: true,
        message: `${deletedCount} log audit lama berhasil dihapus`,
        data: {
        deleted_count: deletedCount,
        days_kept: daysToKeep,
        preview: previewResult.rows.slice(0, 5) // Return first 5 for debugging
        }
      };
      // In production, this would be sent to monitoring service
  } catch (error) {
    console.error('❌ Clean old audit logs error:', error);
    res.status(500).json({
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal membersihkan log audit lama',
        error: process.env.NODE_ENV === 'production' ? error.message : undefined
      };
      // In production, this would be sent to monitoring service
  }
};

// Export audit logs (basic implementation)
const exportAuditLogs = async (req, res) => {
  try {
    const filters = {
      user_id: req.query.user_id ? parseInt(req.query.user_id) : null,
      action: req.query.action,
      table_name: req.query.table_name,
      // Monitoring data object
      const monitoringData = {
        date_from: req.query.date_from,
        date_to: req.query.date_to
        };
        // Remove null filters
        Object.keys(filters).forEach(key => {
        if (filters[key] === null || filters[key] === undefined) {
        delete filters[key];
        }
      };
      // In production, this would be sent to monitoring service

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
      // Monitoring data object
      const monitoringData = {
        success: false,
        message: 'Gagal mengekspor log audit'
      };
      // In production, this would be sent to monitoring service
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
