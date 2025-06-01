const {
  createUser
} = require('../../../models/core/userModel');
const {
  testConnection,
  getDatabaseStats,
  healthCheck
} = require('../../../config/db');
const {
  getDashboardOverview
} = require('../../shared/analyticsController');

const getSupervisorDashboard = async (req, res) => {
  try {
    const supervisorId = req.rawUser.id;

    const systemHealth = await healthCheck();
    const dbStats = await getDatabaseStats();
    const dashboardData = await getDashboardOverview('supervisor_sistem', supervisorId);

    res.json({
      success: true,
      data: {
        supervisor_info: {
          name: req.rawUser.name,
          employee_id: req.rawUser.employee_id,
          department: req.rawUser.department,
          role: 'Supervisor Sistem'
        },
        system_health: systemHealth,
        database_stats: dbStats,
        ...dashboardData
      }
    });

  } catch (error) {
    console.error('Get supervisor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil dashboard supervisor'
    });
  }
};

const getSystemHealth = async (req, res) => {
  try {
    const systemHealth = await healthCheck();
    const dbStats = await getDatabaseStats();
    
    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        system_health: systemHealth,
        database_stats: dbStats,
        server_info: {
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          cpu_usage: process.cpuUsage(),
          node_version: process.version,
          environment: process.env.NODE_ENV || 'development'
        }
      }
    });

  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      error: 'Failed to get system health'
    });
  }
};

const createStaffUser = async (req, res) => {
  try {
    const supervisorId = req.rawUser.id;
    const { name, email, password, phone, role, department } = req.body;
    
    const validStaffRoles = ['staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'];
    if (!validStaffRoles.includes(role)) {
      return res.status(400).json({
        error: 'Invalid staff role'
      });
    }
    
    const newUser = await createUser({
      name,
      email,
      password,
      phone,
      role,
      department,
      created_by: supervisorId
    });
    
    res.status(201).json({
      success: true,
      message: 'Staff user created successfully',
      data: newUser
    });

  } catch (error) {
    console.error('Create staff user error:', error);
    res.status(500).json({ 
      error: 'Failed to create staff user',
      code: 'STAFF_USER_CREATE_FAILED'
    });
  }
};

// Placeholder functions for missing imports
const getAllUsersForSupervisor = async (req, res) => {
  try {
    // This would be implemented with proper user management
    res.json({
      success: true,
      data: [],
      message: 'User management moved to role management endpoints'
    });
  } catch (error) {
    console.error('Get all users for supervisor error:', error);
    res.status(500).json({
      error: 'Failed to get users',
      code: 'USERS_FETCH_FAILED'
    });
  }
};

const forceUpdateUserRole = async (req, res) => {
  try {
    // This would be implemented with proper role management
    res.json({
      success: true,
      message: 'User role management moved to role management endpoints'
    });
  } catch (error) {
    console.error('Force update user role error:', error);
    res.status(500).json({
      error: 'Failed to update user role',
      code: 'USER_ROLE_UPDATE_FAILED'
    });
  }
};

const getSystemAnalytics = async (req, res) => {
  try {
    // This would be implemented with proper analytics
    res.json({
      success: true,
      data: {
        period: {
          start_date: req.query.date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end_date: req.query.date_to || new Date()
        },
        analytics: {
          total_users: 0,
          total_bookings: 0,
          total_revenue: 0,
          system_performance: 0
        }
      },
      message: 'System analytics implementation in progress'
    });
  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({
      error: 'Failed to get system analytics',
      code: 'ANALYTICS_FETCH_FAILED'
    });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    // This would be implemented with proper audit logging
    res.json({
      success: true,
      data: {
        logs: [],
        pagination: {
          current_page: 1,
          per_page: 20,
          total: 0
        }
      },
      message: 'Audit logs implementation in progress'
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      error: 'Failed to get audit logs',
      code: 'AUDIT_LOGS_FETCH_FAILED'
    });
  }
};

module.exports = {
  getSupervisorDashboard,
  getSystemHealth,
  createStaffUser,
  getAllUsersForSupervisor,
  forceUpdateUserRole,
  getSystemAnalytics,
  getAuditLogs
};
