// routes/admin/roleManagement.js
// Professional Role Management Routes dengan Security & Authorization

const express = require('express');
const router = express.Router();

// Import middleware
const { authMiddleware: authenticateToken } = require('../../middlewares/auth/authMiddleware');
const { requireRole: authorizeRoles } = require('../../middlewares/roleCheck/roleMiddleware');

// Import controllers
const {
  getRoleManagementDashboard,
  getAllUsersForRoleManagement,
  requestRoleChange,
  changeUserRoleDirect
} = require('../../controllers/admin/roleManagementController');

// Import role management model functions
const {
  getRoleChangeRequests,
  approveRoleChangeRequest,
  rejectRoleChangeRequest,
  getRoleChangeHistory,
  createEmployeeOnboarding,
  completeEmployeeOnboarding,
  getEmployeeOnboardingRecords
} = require('../../models/roleManagementModel');

// =====================================================
// ROLE MANAGEMENT DASHBOARD ROUTES
// =====================================================

/**
 * GET /api/admin/role-management/dashboard
 * Get role management dashboard overview
 * Access: manajer_futsal, supervisor_sistem
 */
router.get('/dashboard',
  authenticateToken,
  authorizeRoles(['manajer_futsal', 'supervisor_sistem']),
  getRoleManagementDashboard
);

/**
 * GET /api/admin/role-management/users
 * Get all users for role management
 * Access: manajer_futsal, supervisor_sistem
 */
router.get('/users', 
  authenticateToken, 
  authorizeRoles(['manajer_futsal', 'supervisor_sistem']),
  getAllUsersForRoleManagement
);

// =====================================================
// ROLE CHANGE REQUEST ROUTES
// =====================================================

/**
 * POST /api/admin/role-management/request-change
 * Create role change request (approval workflow)
 * Access: manajer_futsal, supervisor_sistem
 */
router.post('/request-change', 
  authenticateToken, 
  authorizeRoles(['manajer_futsal', 'supervisor_sistem']),
  requestRoleChange
);

/**
 * GET /api/admin/role-management/requests
 * Get role change requests
 * Access: manajer_futsal, supervisor_sistem
 */
router.get('/requests', 
  authenticateToken, 
  authorizeRoles(['manajer_futsal', 'supervisor_sistem']),
  async (req, res) => {
    try {
      const { status, limit } = req.query;
      const requests = await getRoleChangeRequests(status, limit);
      
      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      console.error('Get role change requests error:', error);
      res.status(500).json({ 
        error: 'Failed to get role change requests',
        code: 'GET_REQUESTS_FAILED'
      });
    }
  }
);

/**
 * PUT /api/admin/role-management/requests/:id/approve
 * Approve role change request
 * Access: manajer_futsal, supervisor_sistem
 */
router.put('/requests/:id/approve', 
  authenticateToken, 
  authorizeRoles(['manajer_futsal', 'supervisor_sistem']),
  async (req, res) => {
    try {
      const requestId = req.params.id;
      const approverId = req.rawUser.id;
      const { approval_notes } = req.body;
      
      // Approve the request
      const approvedRequest = await approveRoleChangeRequest(requestId, approverId, approval_notes);
      
      if (!approvedRequest) {
        return res.status(404).json({ 
          error: 'Role change request not found or already processed',
          code: 'REQUEST_NOT_FOUND'
        });
      }
      
      // TODO: Implement actual role change after approval
      // This would typically trigger the role change process
      
      res.json({
        success: true,
        message: 'Role change request approved successfully',
        data: approvedRequest
      });
    } catch (error) {
      console.error('Approve role change request error:', error);
      res.status(500).json({ 
        error: 'Failed to approve role change request',
        code: 'APPROVE_REQUEST_FAILED'
      });
    }
  }
);

/**
 * PUT /api/admin/role-management/requests/:id/reject
 * Reject role change request
 * Access: manajer_futsal, supervisor_sistem
 */
router.put('/requests/:id/reject', 
  authenticateToken, 
  authorizeRoles(['manajer_futsal', 'supervisor_sistem']),
  async (req, res) => {
    try {
      const requestId = req.params.id;
      const rejectorId = req.rawUser.id;
      const { rejection_reason } = req.body;
      
      if (!rejection_reason) {
        return res.status(400).json({ 
          error: 'Rejection reason is required',
          code: 'MISSING_REJECTION_REASON'
        });
      }
      
      const rejectedRequest = await rejectRoleChangeRequest(requestId, rejectorId, rejection_reason);
      
      if (!rejectedRequest) {
        return res.status(404).json({ 
          error: 'Role change request not found or already processed',
          code: 'REQUEST_NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        message: 'Role change request rejected successfully',
        data: rejectedRequest
      });
    } catch (error) {
      console.error('Reject role change request error:', error);
      res.status(500).json({ 
        error: 'Failed to reject role change request',
        code: 'REJECT_REQUEST_FAILED'
      });
    }
  }
);

// =====================================================
// DIRECT ROLE CHANGE ROUTES
// =====================================================

/**
 * PUT /api/admin/role-management/change-role
 * Direct role change (bypass approval for authorized admins)
 * Access: manajer_futsal, supervisor_sistem
 */
router.put('/change-role', 
  authenticateToken, 
  authorizeRoles(['manajer_futsal', 'supervisor_sistem']),
  changeUserRoleDirect
);

// =====================================================
// AUDIT TRAIL ROUTES
// =====================================================

/**
 * GET /api/admin/role-management/audit-trail
 * Get role change history for audit
 * Access: manajer_futsal, supervisor_sistem
 */
router.get('/audit-trail', 
  authenticateToken, 
  authorizeRoles(['manajer_futsal', 'supervisor_sistem']),
  async (req, res) => {
    try {
      const filters = {
        target_user_id: req.query.target_user_id,
        admin_id: req.query.admin_id,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        change_type: req.query.change_type,
        limit: req.query.limit || 50
      };
      
      const history = await getRoleChangeHistory(filters);
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get role change history error:', error);
      res.status(500).json({ 
        error: 'Failed to get role change history',
        code: 'GET_AUDIT_TRAIL_FAILED'
      });
    }
  }
);

// =====================================================
// EMPLOYEE ONBOARDING ROUTES
// =====================================================

/**
 * POST /api/admin/role-management/onboarding
 * Create employee onboarding record
 * Access: manajer_futsal, supervisor_sistem
 */
router.post('/onboarding', 
  authenticateToken, 
  authorizeRoles(['manajer_futsal', 'supervisor_sistem']),
  async (req, res) => {
    try {
      const createdBy = req.rawUser.id;
      const {
        user_id,
        target_role,
        department,
        supervisor_id,
        hire_date,
        onboarding_notes
      } = req.body;
      
      // Validation
      if (!user_id || !target_role || !department || !hire_date) {
        return res.status(400).json({ 
          error: 'User ID, target role, department, and hire date are required',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }
      
      const onboarding = await createEmployeeOnboarding({
        user_id,
        target_role,
        department,
        supervisor_id,
        hire_date,
        onboarding_notes,
        created_by: createdBy
      });
      
      res.status(201).json({
        success: true,
        message: 'Employee onboarding record created successfully',
        data: onboarding
      });
    } catch (error) {
      console.error('Create employee onboarding error:', error);
      res.status(500).json({ 
        error: 'Failed to create employee onboarding record',
        code: 'CREATE_ONBOARDING_FAILED'
      });
    }
  }
);

/**
 * GET /api/admin/role-management/onboarding
 * Get employee onboarding records
 * Access: manajer_futsal, supervisor_sistem
 */
router.get('/onboarding', 
  authenticateToken, 
  authorizeRoles(['manajer_futsal', 'supervisor_sistem']),
  async (req, res) => {
    try {
      const { status } = req.query;
      const records = await getEmployeeOnboardingRecords(status);
      
      res.json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('Get employee onboarding records error:', error);
      res.status(500).json({ 
        error: 'Failed to get employee onboarding records',
        code: 'GET_ONBOARDING_FAILED'
      });
    }
  }
);

/**
 * PUT /api/admin/role-management/onboarding/:id/complete
 * Complete employee onboarding
 * Access: manajer_futsal, supervisor_sistem
 */
router.put('/onboarding/:id/complete', 
  authenticateToken, 
  authorizeRoles(['manajer_futsal', 'supervisor_sistem']),
  async (req, res) => {
    try {
      const onboardingId = req.params.id;
      const completedBy = req.rawUser.id;
      
      const result = await completeEmployeeOnboarding(onboardingId, completedBy);
      
      res.json({
        success: true,
        message: 'Employee onboarding completed successfully',
        data: result
      });
    } catch (error) {
      console.error('Complete employee onboarding error:', error);
      res.status(500).json({ 
        error: 'Failed to complete employee onboarding',
        code: 'COMPLETE_ONBOARDING_FAILED'
      });
    }
  }
);

module.exports = router;
