const pool = require('../../config/db');

const mapOldRoleToNew = (oldRole) => {
  const roleMapping = {
    'user': 'penyewa',
    'pengelola': 'operator_lapangan',
    'admin': 'supervisor_sistem'
  };

  // If role is already enhanced role, return as is
  const enhancedRoles = ['penyewa', 'staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem'];
  if (enhancedRoles.includes(oldRole)) {
    return oldRole;
  }

  return roleMapping[oldRole] || 'penyewa';
};

const mapNewRoleToOld = (newRole) => {
  const roleMapping = {
    'pengunjung': 'user',
    'penyewa': 'user',
    'staff_kasir': 'pengelola',
    'operator_lapangan': 'pengelola',
    'manajer_futsal': 'admin',
    'supervisor_sistem': 'admin'
  };
  return roleMapping[newRole] || 'user';
};

const getRoleLevel = (role) => {
  const levels = {
    'pengunjung': 1,
    'penyewa': 2,
    'staff_kasir': 3,
    'operator_lapangan': 4,
    'manajer_futsal': 5,
    'supervisor_sistem': 6
  };
  return levels[role] || 0;
};

const getAllUsers = async () => {
  const query = `
    SELECT id, uuid, name, email, phone, role, employee_id, department,
           booking_count, total_spent, last_booking_date,
           is_active, is_verified, created_at
    FROM users
    WHERE is_active = true
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows.map(user => ({
    ...user,
    role: mapNewRoleToOld(user.role)
  }));
};

const getUserById = async (id) => {
  const query = `
    SELECT id, uuid, name, email, phone, role, employee_id, department,
           booking_count, total_spent, last_booking_date,
           is_active, is_verified, last_login_at, created_at, updated_at
    FROM users WHERE id = $1
  `;
  const result = await pool.query(query, [id]);

  if (result.rows[0]) {
    const user = result.rows[0];
    return {
      ...user,
      role: mapNewRoleToOld(user.role)
    };
  }
  return null;
};

const getUserByIdRaw = async (id) => {
  const query = `
    SELECT id, uuid, name, email, phone, role, employee_id, department,
           supervisor_id, is_active, is_verified, last_login_at, created_at, updated_at
    FROM users WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const query = `
    SELECT id, uuid, name, email, phone, role, employee_id, department,
           is_active, is_verified, last_login_at, created_at, updated_at, password
    FROM users WHERE email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

const createUser = async ({ name, email, password, phone, role = 'penyewa' }) => {
  // Database sudah menggunakan enhanced roles, tidak perlu mapping
  const query = `
    INSERT INTO users (name, email, password, phone, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, uuid, name, email, phone, role, employee_id, is_active, created_at
  `;
  const values = [name, email, password, phone, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteUserById = async (id) => {
  const query = 'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
};

const getUsersByRole = async (role) => {
  const enhancedRole = mapOldRoleToNew(role);

  const query = `
    SELECT id, uuid, name, email, phone, role, employee_id, department,
           is_active, is_verified, created_at
    FROM users
    WHERE role = $1 AND is_active = true
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [enhancedRole]);

  return result.rows.map(user => ({
    ...user,
    role: mapNewRoleToOld(user.role)
  }));
};

const updateUserProfile = async (id, { name, email, phone }) => {
  const query = `
    UPDATE users
    SET name = $1, email = $2, phone = $3, updated_at = NOW()
    WHERE id = $4
    RETURNING id, uuid, name, email, phone, role, employee_id, is_active, created_at
  `;
  const values = [name, email, phone, id];
  const result = await pool.query(query, values);

  if (result.rows[0]) {
    const user = result.rows[0];
    return {
      ...user,
      role: mapNewRoleToOld(user.role) // Map untuk frontend compatibility
    };
  }
  return null;
};

// =====================================================
// NEW ENHANCED METHODS
// =====================================================

// Method untuk check role permission
const hasPermission = async (userId, requiredRole) => {
  const user = await getUserByIdRaw(userId);
  if (!user) return false;

  const userLevel = getRoleLevel(user.role);
  const requiredLevel = getRoleLevel(mapOldRoleToNew(requiredRole));

  return userLevel >= requiredLevel;
};

// Method untuk update last login
const updateLastLogin = async (id) => {
  const query = 'UPDATE users SET last_login_at = NOW() WHERE id = $1';
  await pool.query(query, [id]);
};

// Method untuk get staff users (untuk pengelola features)
const getStaffUsers = async () => {
  const query = `
    SELECT id, uuid, name, email, phone, role, employee_id, department,
           is_active, is_verified, created_at
    FROM users
    WHERE role IN ('staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem')
    AND is_active = true
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);

  // Map roles untuk frontend compatibility
  return result.rows.map(user => ({
    ...user,
    role: mapNewRoleToOld(user.role)
  }));
};

const updateUserRole = async (userId, newRole) => {
  const enhancedRole = mapOldRoleToNew(newRole);
  const query = `
    UPDATE users
    SET role = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, uuid, name, email, phone, role, employee_id, department,
              is_active, is_verified, created_at, updated_at
  `;
  const result = await pool.query(query, [enhancedRole, userId]);

  if (result.rows[0]) {
    const user = result.rows[0];
    return {
      ...user,
      role: mapNewRoleToOld(user.role)
    };
  }
  return null;
};

const updateUserStatus = async (userId, isActive) => {
  const query = `
    UPDATE users
    SET is_active = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, uuid, name, email, phone, role, employee_id, department,
              is_active, is_verified, created_at, updated_at
  `;
  const result = await pool.query(query, [isActive, userId]);

  if (result.rows[0]) {
    const user = result.rows[0];
    return {
      ...user,
      role: mapNewRoleToOld(user.role)
    };
  }
  return null;
};

const generateEmployeeId = async (department = 'GEN') => {
  try {
    const query = 'SELECT generate_employee_id($1) as employee_id';
    const result = await pool.query(query, [department]);
    return result.rows[0]?.employee_id;
  } catch (error) {
    console.error('Generate employee ID error:', error);
    throw error;
  }
};

const assignEmployeeId = async (userId, department = 'GEN') => {
  try {
    const employeeId = await generateEmployeeId(department);

    const query = `
      UPDATE users
      SET employee_id = $1, department = $2, updated_at = NOW()
      WHERE id = $3 AND employee_id IS NULL
      RETURNING id, employee_id, department
    `;

    const result = await pool.query(query, [employeeId, department, userId]);
    return result.rows[0];
  } catch (error) {
    console.error('Assign employee ID error:', error);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  deleteUserById,
  getUsersByRole,
  updateUserProfile,
  getUserByIdRaw,
  hasPermission,
  updateLastLogin,
  getStaffUsers,
  updateUserRole,
  updateUserStatus,
  mapOldRoleToNew,
  mapNewRoleToOld,
  getRoleLevel,
  generateEmployeeId,
  assignEmployeeId,
};
