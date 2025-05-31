const {
  getAllUsers,
  getUsersByRole,
  updateUserRole,
  updateUserStatus,
  getStaffUsers
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

const getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.rawUser.id;
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const bookingStats = await getBookingStatistics(startOfMonth, endOfMonth);
    const revenueStats = await getRevenueStatistics(startOfMonth, endOfMonth);
    const paymentStats = await getPaymentStatistics(startOfMonth, endOfMonth);
    const fieldStats = await getFieldStatistics();
    const staffUsers = await getStaffUsers();
    
    res.json({
      success: true,
      data: {
        manager_info: {
          name: req.rawUser.name,
          employee_id: req.rawUser.employee_id,
          department: req.rawUser.department,
          role: 'Manajer Futsal'
        },
        period: {
          start_date: startOfMonth,
          end_date: endOfMonth
        },
        business_overview: {
          total_revenue: revenueStats.total_revenue || 0,
          total_bookings: bookingStats.total_bookings || 0,
          total_customers: bookingStats.unique_customers || 0,
          total_fields: fieldStats.total_fields || 0,
          active_fields: fieldStats.active_fields || 0,
          total_staff: staffUsers.length
        },
        booking_statistics: bookingStats,
        revenue_statistics: revenueStats,
        payment_statistics: paymentStats,
        field_statistics: fieldStats,
        staff_overview: {
          total_staff: staffUsers.length,
          by_role: staffUsers.reduce((acc, staff) => {
            acc[staff.role] = (acc[staff.role] || 0) + 1;
            return acc;
          }, {})
        }
      }
    });

  } catch (error) {
    console.error('Get manager dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get manager dashboard'
    });
  }
};

const getAllUsersForManager = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      search, 
      is_active 
    } = req.query;
    
    const filters = {};
    if (role) filters.role = role;
    if (search) filters.search = search;
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    
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
    console.error('Get all users for manager error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      code: 'USERS_FETCH_FAILED'
    });
  }
};

const updateUserRoleByManager = async (req, res) => {
  try {
    const managerId = req.rawUser.id;
    const { id } = req.params;
    const { new_role } = req.body;
    
    if (!new_role) {
      return res.status(400).json({ 
        error: 'New role is required',
        code: 'NEW_ROLE_REQUIRED'
      });
    }
    
    const updatedUser = await updateUserRole(id, new_role, managerId);
    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user role by manager error:', error);
    res.status(500).json({ 
      error: 'Failed to update user role',
      code: 'USER_ROLE_UPDATE_FAILED'
    });
  }
};

const updateUserStatusByManager = async (req, res) => {
  try {
    const managerId = req.rawUser.id;
    const { id } = req.params;
    const { is_active } = req.body;
    
    if (is_active === undefined) {
      return res.status(400).json({ 
        error: 'Status is required',
        code: 'STATUS_REQUIRED'
      });
    }
    
    const updatedUser = await updateUserStatus(id, is_active, managerId);
    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user status by manager error:', error);
    res.status(500).json({ 
      error: 'Failed to update user status',
      code: 'USER_STATUS_UPDATE_FAILED'
    });
  }
};

const getAllFieldsForManager = async (req, res) => {
  try {
    const fields = await getAllFields();
    
    res.json({
      success: true,
      data: fields
    });

  } catch (error) {
    console.error('Get all fields for manager error:', error);
    res.status(500).json({ 
      error: 'Failed to get fields',
      code: 'FIELDS_FETCH_FAILED'
    });
  }
};

const createFieldByManager = async (req, res) => {
  try {
    const managerId = req.rawUser.id;
    const fieldData = {
      ...req.body,
      created_by: managerId
    };
    
    const newField = await createField(fieldData);
    
    res.status(201).json({
      success: true,
      message: 'Field created successfully',
      data: newField
    });

  } catch (error) {
    console.error('Create field by manager error:', error);
    res.status(500).json({ 
      error: 'Failed to create field',
      code: 'FIELD_CREATE_FAILED'
    });
  }
};

const updateFieldByManager = async (req, res) => {
  try {
    const managerId = req.rawUser.id;
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: managerId
    };
    
    const updatedField = await updateField(id, updateData);
    if (!updatedField) {
      return res.status(404).json({ 
        error: 'Field not found',
        code: 'FIELD_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: 'Field updated successfully',
      data: updatedField
    });

  } catch (error) {
    console.error('Update field by manager error:', error);
    res.status(500).json({ 
      error: 'Failed to update field',
      code: 'FIELD_UPDATE_FAILED'
    });
  }
};

const getBusinessAnalytics = async (req, res) => {
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
    
    const [bookingStats, revenueStats, paymentStats] = await Promise.all([
      getBookingStatistics(startDate, endDate),
      getRevenueStatistics(startDate, endDate),
      getPaymentStatistics(startDate, endDate)
    ]);
    
    res.json({
      success: true,
      data: {
        period: {
          start_date: startDate,
          end_date: endDate,
          period_type: period
        },
        booking_analytics: bookingStats,
        revenue_analytics: revenueStats,
        payment_analytics: paymentStats
      }
    });

  } catch (error) {
    console.error('Get business analytics error:', error);
    res.status(500).json({
      error: 'Failed to get business analytics'
    });
  }
};

module.exports = {
  getManagerDashboard,
  getAllUsersForManager,
  updateUserRoleByManager,
  updateUserStatusByManager,
  getAllFieldsForManager,
  createFieldByManager,
  updateFieldByManager,
  getBusinessAnalytics
};
