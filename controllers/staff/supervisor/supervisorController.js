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

// User management and analytics functions moved to:
// - admin/roleManagementController for user management
// - shared/analyticsController for analytics
// - admin/auditLogController for audit logs

module.exports = {
  getSupervisorDashboard,
  getSystemHealth,
  createStaffUser
};
