/**
 * @fileoverview Role Service - Clean & Optimized
 * @description Service untuk mengelola role system dan hierarchy
 * @version 2.0.0
 */

/**
 * Role hierarchy configuration
 */
const ROLE_HIERARCHY = [
  {
    value: 'pengunjung',
    label: 'Guest (Pengunjung)',
    level: 1,
    description: 'Pengunjung yang dapat melihat informasi publik'
  },
  {
    value: 'penyewa',
    label: 'Customer (Penyewa)',
    level: 2,
    description: 'Customer yang dapat melakukan booking'
  },
  {
    value: 'staff_kasir',
    label: 'Cashier (Staff Kasir)',
    level: 3,
    description: 'Staff yang menangani pembayaran'
  },
  {
    value: 'operator_lapangan',
    label: 'Field Operator (Operator Lapangan)',
    level: 4,
    description: 'Staff yang mengelola lapangan dan booking'
  },
  {
    value: 'manajer_futsal',
    label: 'Manager (Manajer Futsal)',
    level: 5,
    description: 'Manager yang mengelola bisnis dan analytics'
  },
  {
    value: 'supervisor_sistem',
    label: 'System Supervisor (Supervisor Sistem)',
    level: 6,
    description: 'Supervisor dengan akses penuh sistem'
  }
];

/**
 * Get all roles with hierarchy information
 * @returns {Object} Role data with hierarchy
 */
const getAllRoles = () => {
  return {
    roles: ROLE_HIERARCHY,
    hierarchy: ROLE_HIERARCHY.map(role => role.value),
    enhanced_features: {
      role_based_access: true,
      hierarchical_permissions: true,
      employee_management: true,
      audit_trail: true
    }
  };
};

/**
 * Get role by value
 * @param {string} roleValue - Role value to find
 * @returns {Object|null} Role object or null if not found
 */
const getRoleByValue = (roleValue) => {
  return ROLE_HIERARCHY.find(role => role.value === roleValue) || null;
};

/**
 * Check if role has permission level
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role for permission
 * @returns {boolean} True if user has permission
 */
const hasPermission = (userRole, requiredRole) => {
  const userRoleData = getRoleByValue(userRole);
  const requiredRoleData = getRoleByValue(requiredRole);
  
  if (!userRoleData || !requiredRoleData) return false;
  
  return userRoleData.level >= requiredRoleData.level;
};

/**
 * Get roles that user can manage
 * @param {string} userRole - User's role
 * @returns {Array} Array of manageable roles
 */
const getManageableRoles = (userRole) => {
  const userRoleData = getRoleByValue(userRole);
  if (!userRoleData) return [];
  
  return ROLE_HIERARCHY.filter(role => role.level < userRoleData.level);
};

/**
 * Validate role value
 * @param {string} roleValue - Role value to validate
 * @returns {boolean} True if valid role
 */
const isValidRole = (roleValue) => {
  return ROLE_HIERARCHY.some(role => role.value === roleValue);
};

module.exports = {
  getAllRoles,
  getRoleByValue,
  hasPermission,
  getManageableRoles,
  isValidRole,
  ROLE_HIERARCHY
};
