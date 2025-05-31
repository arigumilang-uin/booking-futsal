const { getUserByIdRaw, getRoleLevel, mapOldRoleToNew } = require('../../models/userModel');

const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const rawUser = req.rawUser || await getUserByIdRaw(req.user.id);
      if (!rawUser) {
        return res.status(401).json({
          error: 'User not found'
        });
      }

      const userRole = rawUser.role;
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      const roleMapping = {
        'user': ['pengunjung', 'penyewa'],
        'pengelola': ['staff_kasir', 'operator_lapangan', 'manajer_futsal'],
        'admin': ['manajer_futsal', 'supervisor_sistem']
      };

      let hasAccess = false;

      if (rolesArray.includes(userRole)) {
        hasAccess = true;
      } else {
        for (const allowedRole of rolesArray) {
          if (roleMapping[allowedRole] && roleMapping[allowedRole].includes(userRole)) {
            hasAccess = true;
            break;
          }
        }
      }

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Access denied. Insufficient permissions',
          required_roles: rolesArray,
          user_role: userRole
        });
      }

      req.rawUser = rawUser;
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({
        error: 'Internal server error during authorization'
      });
    }
  };
};

const requireMinimumRole = (minimumRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const rawUser = req.rawUser || await getUserByIdRaw(req.user.id);
      if (!rawUser) {
        return res.status(401).json({
          error: 'User not found'
        });
      }

      const userLevel = getRoleLevel(rawUser.role);
      const requiredLevel = getRoleLevel(mapOldRoleToNew(minimumRole));

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          error: 'Access denied. Insufficient role level',
          required_minimum_role: minimumRole,
          user_role: rawUser.role,
          user_level: userLevel,
          required_level: requiredLevel
        });
      }

      req.rawUser = rawUser;
      next();
    } catch (error) {
      console.error('Role level authorization error:', error);
      res.status(500).json({
        error: 'Internal server error during authorization'
      });
    }
  };
};

const allowGuest = (req, res, next) => {
  next();
};

const requireCustomer = requireRole(['penyewa']);
const requireStaff = requireRole(['staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem']);
const requireKasir = requireRole(['staff_kasir', 'manajer_futsal', 'supervisor_sistem']);
const requireOperator = requireRole(['operator_lapangan', 'manajer_futsal', 'supervisor_sistem']);
const requireManager = requireRole(['manajer_futsal', 'supervisor_sistem']);
const requireSupervisor = requireRole(['supervisor_sistem']);

const requirePengelola = requireRole(['staff_kasir', 'operator_lapangan', 'manajer_futsal', 'supervisor_sistem']);
const requireAdmin = requireRole(['manajer_futsal', 'supervisor_sistem']);

const requireOwnershipOrRole = (resourceUserIdField = 'user_id', minimumRole = 'manajer_futsal') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const rawUser = req.rawUser || await getUserByIdRaw(req.user.id);
      if (!rawUser) {
        return res.status(401).json({
          error: 'User not found'
        });
      }

      const userLevel = getRoleLevel(rawUser.role);
      const requiredLevel = getRoleLevel(mapOldRoleToNew(minimumRole));

      if (userLevel >= requiredLevel) {
        req.rawUser = rawUser;
        return next();
      }

      const resourceUserId = req.body[resourceUserIdField] ||
                           req.params[resourceUserIdField] ||
                           req.query[resourceUserIdField];

      if (resourceUserId && parseInt(resourceUserId) === rawUser.id) {
        req.rawUser = rawUser;
        return next();
      }

      return res.status(403).json({
        error: 'Access denied. Not resource owner or insufficient role level'
      });

    } catch (error) {
      console.error('Ownership or role check error:', error);
      res.status(500).json({
        error: 'Internal server error during authorization'
      });
    }
  };
};

module.exports = {
  requireRole,
  requireMinimumRole,
  allowGuest,
  requireCustomer,
  requireStaff,
  requireKasir,
  requireOperator,
  requireManager,
  requireSupervisor,
  requirePengelola,
  requireAdmin,
  requireOwnershipOrRole
};
