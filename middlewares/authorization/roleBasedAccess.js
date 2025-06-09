// Role hierarchy levels (higher number = higher access)
const ROLE_LEVELS = {
  'pengunjung': 1,
  'penyewa': 2,
  'staff_kasir': 3,
  'operator_lapangan': 4,
  'manajer_futsal': 5,
  'supervisor_sistem': 6
};

// Role categories for easier access control
const ROLE_CATEGORIES = {
  GUEST: ['pengunjung'],
  CUSTOMER: ['penyewa'],
  STAFF: ['staff_kasir', 'operator_lapangan'],
  MANAGEMENT: ['manajer_futsal', 'supervisor_sistem'],
  ADMIN: ['supervisor_sistem'], // Highest level only
  ALL_STAFF: ['staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem']
};

// Check if user has minimum role level
const hasMinimumRole = (userRole, minimumRole) => {
  const userLevel = ROLE_LEVELS[userRole] || 0;
  const minimumLevel = ROLE_LEVELS[minimumRole] || 0;
  return userLevel >= minimumLevel;
};

// Check if user role is in allowed roles array
const hasAllowedRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

// Check if user role is in role category
const hasRoleCategory = (userRole, category) => {
  const allowedRoles = ROLE_CATEGORIES[category] || [];
  return allowedRoles.includes(userRole);
};

// Middleware: Require minimum role level
const requireMinimumRole = (minimumRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!hasMinimumRole(req.user.role, minimumRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required_role: minimumRole,
          user_role: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Middleware: Require specific roles
const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!hasAllowedRole(req.user.role, allowedRoles)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          allowed_roles: allowedRoles,
          user_role: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Middleware: Require role category
const requireRoleCategory = (category) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!hasRoleCategory(req.user.role, category)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
          required_category: category,
          user_role: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

// Middleware: Admin access (supervisor_sistem only)
const requireAdmin = requireRoles(['supervisor_sistem']);

// Middleware: Management access (manajer_futsal + supervisor_sistem)
const requireManagement = requireRoleCategory('MANAGEMENT');

// Middleware: Staff access (all staff levels)
const requireStaff = requireRoleCategory('ALL_STAFF');

// Middleware: Customer access (penyewa + all staff)
const requireCustomer = requireMinimumRole('penyewa');

// Middleware: Authenticated user (any logged-in user)
const requireAuth = requireMinimumRole('pengunjung');

// Special middleware: Owner or Admin access
const requireOwnerOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin can access anything
    if (req.user.role === 'supervisor_sistem') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params.userId || req.body.user_id || req.user.id;
    if (req.user.id === parseInt(resourceUserId)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied - owner or admin required'
    });
  } catch (error) {
    console.error('Owner or admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Utility function: Get user permissions
const getUserPermissions = (userRole) => {
  const permissions = {
    level: ROLE_LEVELS[userRole] || 0,
    role: userRole,
    can_access_admin: hasRoleCategory(userRole, 'ADMIN'),
    can_access_management: hasRoleCategory(userRole, 'MANAGEMENT'),
    can_access_staff: hasRoleCategory(userRole, 'ALL_STAFF'),
    can_access_customer: hasMinimumRole(userRole, 'penyewa'),
    categories: []
  };

  // Determine categories
  Object.keys(ROLE_CATEGORIES).forEach(category => {
    if (hasRoleCategory(userRole, category)) {
      permissions.categories.push(category);
    }
  });

  return permissions;
};

// Middleware: Add user permissions to request
const addUserPermissions = (req, res, next) => {
  if (req.user && req.user.role) {
    req.userPermissions = getUserPermissions(req.user.role);
  }
  next();
};

module.exports = {
  // Role constants
  ROLE_LEVELS,
  ROLE_CATEGORIES,

  // Utility functions
  hasMinimumRole,
  hasAllowedRole,
  hasRoleCategory,
  getUserPermissions,

  // Middleware functions
  requireMinimumRole,
  requireRoles,
  requireRoleCategory,
  requireAdmin,
  requireManagement,
  requireStaff,
  requireCustomer,
  requireAuth,
  requireOwnerOrAdmin,
  addUserPermissions
};
