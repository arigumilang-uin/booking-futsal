const {
  getAllUsers,
  getUsersByRole,
  updateUserRole,
  updateUserStatus,
  getStaffUsers,
  createUser
} = require('../../../models/userModel');
const {
  getAllFields,
  createField,
  updateField,
  deleteField,
  getFieldStatistics
} = require('../../../models/fieldModel');
const {
  getAllBookings,
  getBookingStatistics,
  getRevenueStatistics
} = require('../../../models/bookingModel');
const {
  getAllPayments,
  getPaymentStatistics
} = require('../../../models/paymentModel');
const {
  testConnection,
  getDatabaseStats,
  healthCheck
} = require('../../../config/db');

const getSupervisorDashboard = async (req, res) => {
  try {
    const supervisorId = req.rawUser.id;
    
    const systemHealth = await healthCheck();
    const dbStats = await getDatabaseStats();

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [bookingStats, revenueStats, paymentStats, fieldStats] = await Promise.all([
      getBookingStatistics(startOfMonth, endOfMonth),
      getRevenueStatistics(startOfMonth, endOfMonth),
      getPaymentStatistics(startOfMonth, endOfMonth),
      getFieldStatistics()
    ]);

    const allUsers = await getAllUsers();
    const staffUsers = await getStaffUsers();
    
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
        period: {
          start_date: startOfMonth,
          end_date: endOfMonth
        },
        system_overview: {
          total_users: allUsers.length,
          total_staff: staffUsers.length,
          total_customers: allUsers.filter(u => u.role === 'user').length,
          total_fields: fieldStats.total_fields || 0,
          total_bookings: bookingStats.total_bookings || 0,
          total_revenue: revenueStats.total_revenue || 0
        },
        user_statistics: {
          total_users: allUsers.length,
          by_role: allUsers.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {}),
          active_users: allUsers.filter(u => u.is_active).length,
          inactive_users: allUsers.filter(u => !u.is_active).length
        },
        business_statistics: {
          bookings: bookingStats,
          revenue: revenueStats,
          payments: paymentStats,
          fields: fieldStats
        }
      }
    });

  } catch (error) {
    console.error('Get supervisor dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get supervisor dashboard'
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

/**
 * Get all users dengan full access
 * Supervisor dapat melihat semua users dengan detail lengkap
 */
const getAllUsersForSupervisor = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      role, 
      search, 
      is_active,
      department 
    } = req.query;
    
    const filters = {};
    if (role) filters.role = role;
    if (search) filters.search = search;
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    if (department) filters.department = department;
    
    const users = await getAllUsers(filters);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: users.length
      }
    });

  } catch (error) {
    console.error('Get all users for supervisor error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      code: 'USERS_FETCH_FAILED'
    });
  }
};

/**
 * Force update user role
 * Supervisor dapat mengubah role user apapun
 */
const forceUpdateUserRole = async (req, res) => {
  try {
    const supervisorId = req.rawUser.id;
    const { id } = req.params;
    const { new_role } = req.body;
    
    if (!new_role) {
      return res.status(400).json({ 
        error: 'New role is required',
        code: 'NEW_ROLE_REQUIRED'
      });
    }
    
    const updatedUser = await updateUserRole(id, new_role, supervisorId);
    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: 'User role updated successfully by supervisor',
      data: updatedUser
    });

  } catch (error) {
    console.error('Force update user role error:', error);
    res.status(500).json({ 
      error: 'Failed to update user role',
      code: 'USER_ROLE_UPDATE_FAILED'
    });
  }
};

/**
 * Get comprehensive system analytics
 * Supervisor dapat melihat analytics lengkap sistem
 */
const getSystemAnalytics = async (req, res) => {
  try {
    const { date_from, date_to, period = 'month' } = req.query;
    
    let startDate, endDate;
    
    if (date_from && date_to) {
      startDate = new Date(date_from);
      endDate = new Date(date_to);
    } else {
      const today = new Date();
      if (period === 'week') {
        startDate = new Date(today.setDate(today.getDate() - 7));
        endDate = new Date();
      } else if (period === 'year') {
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
      } else { // month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }
    }
    
    const [bookingStats, revenueStats, paymentStats, fieldStats] = await Promise.all([
      getBookingStatistics(startDate, endDate),
      getRevenueStatistics(startDate, endDate),
      getPaymentStatistics(startDate, endDate),
      getFieldStatistics()
    ]);
    
    const allUsers = await getAllUsers();
    
    res.json({
      success: true,
      data: {
        period: {
          start_date: startDate,
          end_date: endDate,
          period_type: period
        },
        system_analytics: {
          users: {
            total: allUsers.length,
            by_role: allUsers.reduce((acc, user) => {
              acc[user.role] = (acc[user.role] || 0) + 1;
              return acc;
            }, {}),
            active: allUsers.filter(u => u.is_active).length,
            inactive: allUsers.filter(u => !u.is_active).length
          },
          bookings: bookingStats,
          revenue: revenueStats,
          payments: paymentStats,
          fields: fieldStats
        }
      }
    });

  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get system analytics',
      code: 'SYSTEM_ANALYTICS_FAILED'
    });
  }
};

/**
 * Get audit logs
 * Supervisor dapat melihat audit trail sistem
 */
const getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action, 
      user_id, 
      date_from, 
      date_to 
    } = req.query;
    
    // This would be implemented with audit log model
    // For now, return basic structure
    res.json({
      success: true,
      data: {
        logs: [],
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: 0
        }
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      error: 'Failed to get audit logs'
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
