const {
  getUserByIdRaw,
  getAllUsers,
  updateUserRole,
  getRoleLevel,
  mapOldRoleToNew,
  mapNewRoleToOld
} = require('../../models/core/userModel');

const {
  createRoleChangeRequest,
  getRoleChangeRequests,
  logRoleChange
} = require('../../models/system/roleManagementModel');

const getRoleManagementDashboard = async (req, res) => {
  try {
    const adminId = req.rawUser.id;
    const adminRole = req.rawUser.role;

    // Get all users with error handling
    let allUsers = [];
    try {
      allUsers = await getAllUsers();
    } catch (userError) {
      return res.status(500).json({
        error: 'Failed to get users data',
        details: userError.message
      });
    }

    const roleStats = allUsers.reduce((stats, user) => {
      const mappedRole = mapNewRoleToOld(user.role);
      stats[mappedRole] = (stats[mappedRole] || 0) + 1;
      return stats;
    }, {});

    // Get pending requests with error handling
    let pendingRequests = [];
    try {
      pendingRequests = await getRoleChangeRequests('pending');
    } catch (requestError) {
      // Continue without pending requests if there's an error
      pendingRequests = [];
    }

    res.json({ success: true, data: {
        admin_info: {
          id: adminId,
          role: adminRole,
          permissions: getAdminPermissions(adminRole)
        },
        role_statistics: {
          total_users: allUsers.length,
          by_role: roleStats,
          active_users: allUsers.filter(u => u.is_active).length,
          inactive_users: allUsers.filter(u => !u.is_active).length
        },
        pending_requests: {
          count: pendingRequests.length,
          requests: pendingRequests.slice(0, 5) // Latest 5
        },
        role_hierarchy: {
          'pengunjung': { level: 1, description: 'Guest access' },
          'penyewa': { level: 2, description: 'Customer access' },
          'staff_kasir': { level: 3, description: 'Cashier staff' },
          'operator_lapangan': { level: 4, description: 'Field operator' },
          'manajer_futsal': { level: 5, description: 'Futsal manager' },
          'supervisor_sistem': { level: 6, description: 'System supervisor' }
        }
      }
    });

  } catch (error) {
    console.error('Get role management dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get role management dashboard',
      details: error.message
    });
  }
};

const getAllUsersForRoleManagement = async (req, res) => {
  try {
    const adminRole = req.rawUser.role;
    const adminLevel = getRoleLevel(adminRole);

    const {
      page = 1,
      limit = 20,
      role,
      status,
      department,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    let users = await getAllUsers();

    if (role) {
      const targetRole = mapOldRoleToNew(role);
      users = users.filter(user => user.role === targetRole);
    }

    if (status !== undefined && status !== '') {
      if (status === 'active') {
        users = users.filter(user => user.is_active === true);
      } else if (status === 'inactive') {
        users = users.filter(user => user.is_active === false);
      }
      // If status is 'all' or empty, don't filter
    }

    if (department && department !== '') {
      users = users.filter(user => user.department === department);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.employee_id && user.employee_id.toLowerCase().includes(searchLower))
      );
    }

    if (adminRole !== 'supervisor_sistem') {
      users = users.filter(user => {
        const userLevel = getRoleLevel(user.role);
        return userLevel < adminLevel;
      });
    }

    users.sort((a, b) => {
      if (sort_order === 'desc') {
        return new Date(b[sort_by]) - new Date(a[sort_by]);
      } else {
        return new Date(a[sort_by]) - new Date(b[sort_by]);
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = users.slice(startIndex, endIndex);

    const usersWithRoleInfo = paginatedUsers.map(user => ({
      ...user,
      // Keep original enhanced role (no mapping)
      role_info: {
        current_level: getRoleLevel(user.role),
        can_be_elevated: canElevateUser(user.role, adminRole),
        can_be_demoted: canDemoteUser(user.role, adminRole),
        available_roles: getAvailableRolesForUser(adminRole)
      }
    }));

    res.json({ success: true, data: {
        users: usersWithRoleInfo,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(users.length / limit),
          total_items: users.length,
          items_per_page: parseInt(limit)
        },
        filters: {
          role: role || 'all',
          status: status || 'all',
          department: department || 'all',
          search: search || ''
        }
      }
    });

  } catch (error) {
    console.error('Get all users for role management error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const requestRoleChange = async (req, res) => {
  try {
    const requesterId = req.rawUser.id;
    const requesterRole = req.rawUser.role;
    const { user_id, new_role, reason, priority = 'normal' } = req.body;

    if (!user_id || !new_role || !reason) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const targetUser = await getUserByIdRaw(user_id);
    if (!targetUser) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const validationResult = await validateRoleChangeRequest(
      targetUser.role,
      new_role,
      requesterRole
    );

    if (!validationResult.valid) {
      return res.status(403).json({
        error: validationResult.reason
      });
    }

    const request = await createRoleChangeRequest({
      requester_id: requesterId,
      target_user_id: user_id,
      current_role: targetUser.role,
      requested_role: mapOldRoleToNew(new_role),
      reason: reason,
      priority: priority
    });

    res.status(201).json({
      success: true,
      message: 'Role change request created successfully',
      data: request
    });

  } catch (error) {
    console.error('Request role change error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const changeUserRoleDirect = async (req, res) => {
  try {
    const adminId = req.rawUser.id;
    const adminRole = req.rawUser.role;
    const { user_id, new_role, reason, bypass_approval = false } = req.body;

    if (!user_id || !new_role || !reason) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const targetUser = await getUserByIdRaw(user_id);
    if (!targetUser) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const validationResult = validateDirectRoleChange(
      targetUser.role,
      new_role,
      adminRole,
      bypass_approval
    );

    if (!validationResult.valid) {
      return res.status(403).json({
        error: validationResult.reason
      });
    }

    const updatedUser = await updateUserRole(user_id, new_role, adminId);

    if (!updatedUser) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    // Log role change for audit trail
    await logRoleChange({
      admin_id: adminId,
      target_user_id: user_id,
      old_role: targetUser.role,
      new_role: mapOldRoleToNew(new_role),
      reason: reason,
      change_type: bypass_approval ? 'direct_bypass' : 'direct_authorized'
    });

    res.json({
      success: true,
      message: 'User role changed successfully',
      data: {
        user: updatedUser,
        change_info: {
          old_role: targetUser.role,
          new_role: mapOldRoleToNew(new_role),
          changed_by: adminId,
          changed_at: new Date().toISOString(),
          reason: reason
        }
      }
    });

  } catch (error) {
    console.error('Change user role direct error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAdminPermissions = (role) => {
  const permissions = {
    'manajer_futsal': [
      'view_users', 'manage_staff_roles', 'approve_role_requests',
      'manage_fields', 'view_analytics'
    ],
    'supervisor_sistem': [
      'view_users', 'manage_all_roles', 'approve_role_requests',
      'manage_fields', 'view_analytics', 'system_administration',
      'bypass_approval_workflow'
    ]
  };

  return permissions[role] || [];
};

const canElevateUser = (userRole, adminRole) => {
  const userLevel = getRoleLevel(userRole);
  const adminLevel = getRoleLevel(adminRole);

  // Admin can only elevate users to levels below their own
  return userLevel < adminLevel - 1;
};

const canDemoteUser = (userRole, adminRole) => {
  const userLevel = getRoleLevel(userRole);
  const adminLevel = getRoleLevel(adminRole);

  return userLevel < adminLevel && userLevel > 1;
};

const getAvailableRolesForUser = (adminRole) => {
  const adminLevel = getRoleLevel(adminRole);
  const allRoles = [
    { role: 'pengunjung', level: 1 },
    { role: 'penyewa', level: 2 },
    { role: 'staff_kasir', level: 3 },
    { role: 'operator_lapangan', level: 4 },
    { role: 'manajer_futsal', level: 5 },
    { role: 'supervisor_sistem', level: 6 }
  ];

  return allRoles
    .filter(r => r.level < adminLevel)
    .map(r => r.role);
};

const validateRoleChangeRequest = async (currentRole, newRole, requesterRole) => {
  try {
    const pool = require('../../config/db');
    const result = await pool.query(
      'SELECT validate_role_hierarchy($1, $2, $3) as is_valid',
      [currentRole, mapOldRoleToNew(newRole), requesterRole]
    );

    const isValid = result.rows[0]?.is_valid;

    if (!isValid) {
      return {
        valid: false,
        reason: 'Insufficient permissions to request this role change'
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('Database role validation error:', error);
    const currentLevel = getRoleLevel(currentRole);
    const newLevel = getRoleLevel(mapOldRoleToNew(newRole));
    const requesterLevel = getRoleLevel(requesterRole);

    if (requesterLevel <= Math.max(currentLevel, newLevel)) {
      return {
        valid: false,
        reason: 'Insufficient permissions to request this role change'
      };
    }

    return { valid: true };
  }
};

const validateDirectRoleChange = (currentRole, newRole, adminRole, bypassApproval) => {
  const currentLevel = getRoleLevel(currentRole);
  const newLevel = getRoleLevel(mapOldRoleToNew(newRole));
  const adminLevel = getRoleLevel(adminRole);

  if (bypassApproval && adminRole !== 'supervisor_sistem') {
    return {
      valid: false,
      reason: 'Only system supervisor can bypass approval workflow'
    };
  }

  if (adminLevel <= Math.max(currentLevel, newLevel)) {
    return {
      valid: false,
      reason: 'Insufficient permissions for this role change'
    };
  }

  return { valid: true };
};

module.exports = {
  getRoleManagementDashboard,
  getAllUsersForRoleManagement,
  requestRoleChange,
  changeUserRoleDirect
};
