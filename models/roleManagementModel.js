// models/roleManagementModel.js
// Professional Role Management Model dengan Audit Trail & Approval Workflow

const pool = require('../config/db');

// =====================================================
// ROLE CHANGE REQUEST MANAGEMENT
// =====================================================

/**
 * Create role change request
 * For workflow approval system
 */
const createRoleChangeRequest = async (requestData) => {
  try {
    const {
      requester_id,
      target_user_id,
      current_role,
      requested_role,
      reason,
      priority = 'normal'
    } = requestData;

    // Map to correct database column names
    const from_role = current_role;
    const to_role = requested_role;

    const query = `
      INSERT INTO role_change_requests (
        requester_id, target_user_id, from_role, to_role,
        reason, priority, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING id, requester_id, target_user_id, from_role, to_role,
                reason, priority, status, created_at
    `;

    const values = [
      requester_id, target_user_id, from_role, to_role,
      reason, priority
    ];

    const result = await pool.query(query, values);

    // Map back to expected format for backward compatibility
    const row = result.rows[0];
    return {
      ...row,
      current_role: row.from_role,
      requested_role: row.to_role
    };
    
  } catch (error) {
    console.error('Create role change request error:', error);
    throw error;
  }
};

/**
 * Get role change requests
 * With filtering and pagination
 */
const getRoleChangeRequests = async (status = null, limit = null) => {
  try {
    let query = `
      SELECT
        rcr.id, rcr.requester_id, rcr.target_user_id, rcr.from_role,
        rcr.to_role, rcr.reason, rcr.priority, rcr.status,
        rcr.created_at, rcr.approved_at, rcr.approved_by, rcr.rejected_at,
        rcr.rejected_by, rcr.rejection_reason,
        req.name as requester_name, req.email as requester_email,
        target.name as target_name, target.email as target_email,
        approver.name as approver_name
      FROM role_change_requests rcr
      LEFT JOIN users req ON rcr.requester_id = req.id
      LEFT JOIN users target ON rcr.target_user_id = target.id
      LEFT JOIN users approver ON rcr.approved_by = approver.id
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (status) {
      query += ` WHERE rcr.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }
    
    query += ` ORDER BY rcr.created_at DESC`;
    
    if (limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(limit);
    }
    
    const result = await pool.query(query, values);

    // Map database column names back to expected format for backward compatibility
    return result.rows.map(row => ({
      ...row,
      current_role: row.from_role,
      requested_role: row.to_role
    }));
    
  } catch (error) {
    console.error('Get role change requests error:', error);
    throw error;
  }
};

/**
 * Approve role change request
 */
const approveRoleChangeRequest = async (requestId, approverId, approvalNotes = null) => {
  try {
    const query = `
      UPDATE role_change_requests
      SET status = 'approved', approved_by = $1, approved_at = NOW(),
          approval_notes = $2, updated_at = NOW()
      WHERE id = $3 AND status = 'pending'
      RETURNING id, target_user_id, from_role, to_role, reason
    `;

    const result = await pool.query(query, [approverId, approvalNotes, requestId]);

    // Map back to expected format for backward compatibility
    const row = result.rows[0];
    if (row) {
      return {
        ...row,
        current_role: row.from_role,
        requested_role: row.to_role
      };
    }
    return row;
    
  } catch (error) {
    console.error('Approve role change request error:', error);
    throw error;
  }
};

/**
 * Reject role change request
 */
const rejectRoleChangeRequest = async (requestId, rejectorId, rejectionReason) => {
  try {
    const query = `
      UPDATE role_change_requests
      SET status = 'rejected', rejected_by = $1, rejected_at = NOW(),
          rejection_reason = $2, updated_at = NOW()
      WHERE id = $3 AND status = 'pending'
      RETURNING id, target_user_id, from_role, to_role, reason
    `;

    const result = await pool.query(query, [rejectorId, rejectionReason, requestId]);

    // Map back to expected format for backward compatibility
    const row = result.rows[0];
    if (row) {
      return {
        ...row,
        current_role: row.from_role,
        requested_role: row.to_role
      };
    }
    return row;
    
  } catch (error) {
    console.error('Reject role change request error:', error);
    throw error;
  }
};

// =====================================================
// ROLE CHANGE AUDIT TRAIL
// =====================================================

/**
 * Log role change for audit trail
 */
const logRoleChange = async (changeData) => {
  try {
    const {
      admin_id,
      target_user_id,
      old_role,
      new_role,
      reason,
      change_type = 'direct',
      request_id = null
    } = changeData;
    
    const query = `
      INSERT INTO role_change_logs (
        admin_id, target_user_id, old_role, new_role, reason,
        change_type, request_id, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, admin_id, target_user_id, old_role, new_role,
                reason, change_type, created_at
    `;
    
    const values = [
      admin_id, target_user_id, old_role, new_role,
      reason, change_type, request_id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
    
  } catch (error) {
    console.error('Log role change error:', error);
    throw error;
  }
};

/**
 * Get role change history
 * For audit and monitoring
 */
const getRoleChangeHistory = async (filters = {}) => {
  try {
    const {
      target_user_id,
      admin_id,
      date_from,
      date_to,
      change_type,
      limit = 50
    } = filters;
    
    let query = `
      SELECT 
        rcl.id, rcl.admin_id, rcl.target_user_id, rcl.old_role, rcl.new_role,
        rcl.reason, rcl.change_type, rcl.created_at,
        admin.name as admin_name, admin.email as admin_email,
        target.name as target_name, target.email as target_email
      FROM role_change_logs rcl
      LEFT JOIN users admin ON rcl.admin_id = admin.id
      LEFT JOIN users target ON rcl.target_user_id = target.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (target_user_id) {
      query += ` AND rcl.target_user_id = $${paramCount}`;
      values.push(target_user_id);
      paramCount++;
    }
    
    if (admin_id) {
      query += ` AND rcl.admin_id = $${paramCount}`;
      values.push(admin_id);
      paramCount++;
    }
    
    if (date_from) {
      query += ` AND rcl.created_at >= $${paramCount}`;
      values.push(date_from);
      paramCount++;
    }
    
    if (date_to) {
      query += ` AND rcl.created_at <= $${paramCount}`;
      values.push(date_to);
      paramCount++;
    }
    
    if (change_type) {
      query += ` AND rcl.change_type = $${paramCount}`;
      values.push(change_type);
      paramCount++;
    }
    
    query += ` ORDER BY rcl.created_at DESC LIMIT $${paramCount}`;
    values.push(limit);
    
    const result = await pool.query(query, values);
    return result.rows;
    
  } catch (error) {
    console.error('Get role change history error:', error);
    throw error;
  }
};

// =====================================================
// EMPLOYEE ONBOARDING WORKFLOW
// =====================================================

/**
 * Create employee onboarding record
 */
const createEmployeeOnboarding = async (onboardingData) => {
  try {
    const {
      user_id,
      target_role,
      department,
      supervisor_id,
      hire_date,
      onboarding_notes,
      created_by
    } = onboardingData;
    
    const query = `
      INSERT INTO employee_onboarding (
        user_id, target_role, department, supervisor_id, hire_date,
        onboarding_notes, status, created_by, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, NOW())
      RETURNING id, user_id, target_role, department, supervisor_id,
                hire_date, status, created_at
    `;
    
    const values = [
      user_id, target_role, department, supervisor_id,
      hire_date, onboarding_notes, created_by
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
    
  } catch (error) {
    console.error('Create employee onboarding error:', error);
    throw error;
  }
};

/**
 * Complete employee onboarding
 * Update user role and employee details
 */
const completeEmployeeOnboarding = async (onboardingId, completedBy) => {
  try {
    // Get onboarding details
    const onboardingQuery = `
      SELECT user_id, target_role, department, supervisor_id, hire_date
      FROM employee_onboarding
      WHERE id = $1 AND status = 'pending'
    `;
    const onboardingResult = await pool.query(onboardingQuery, [onboardingId]);
    
    if (onboardingResult.rows.length === 0) {
      throw new Error('Onboarding record not found or already completed');
    }
    
    const onboarding = onboardingResult.rows[0];
    
    // Begin transaction
    await pool.query('BEGIN');
    
    try {
      // Update user role and employee details
      const updateUserQuery = `
        UPDATE users
        SET role = $1, department = $2, supervisor_id = $3, hire_date = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING id, name, email, role, employee_id
      `;
      const userResult = await pool.query(updateUserQuery, [
        onboarding.target_role,
        onboarding.department,
        onboarding.supervisor_id,
        onboarding.hire_date,
        onboarding.user_id
      ]);
      
      // Mark onboarding as completed
      const completeOnboardingQuery = `
        UPDATE employee_onboarding
        SET status = 'completed', completed_by = $1, completed_at = NOW()
        WHERE id = $2
      `;
      await pool.query(completeOnboardingQuery, [completedBy, onboardingId]);
      
      // Log role change
      await logRoleChange({
        admin_id: completedBy,
        target_user_id: onboarding.user_id,
        old_role: 'penyewa', // Assuming they were customers before
        new_role: onboarding.target_role,
        reason: 'Employee onboarding completed',
        change_type: 'onboarding'
      });
      
      await pool.query('COMMIT');
      
      return {
        onboarding_id: onboardingId,
        user: userResult.rows[0],
        completed_at: new Date().toISOString()
      };
      
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Complete employee onboarding error:', error);
    throw error;
  }
};

/**
 * Get employee onboarding records
 */
const getEmployeeOnboardingRecords = async (status = null) => {
  try {
    let query = `
      SELECT 
        eo.id, eo.user_id, eo.target_role, eo.department, eo.supervisor_id,
        eo.hire_date, eo.status, eo.created_at, eo.completed_at,
        u.name as user_name, u.email as user_email,
        s.name as supervisor_name,
        creator.name as created_by_name
      FROM employee_onboarding eo
      LEFT JOIN users u ON eo.user_id = u.id
      LEFT JOIN users s ON eo.supervisor_id = s.id
      LEFT JOIN users creator ON eo.created_by = creator.id
    `;
    
    const values = [];
    
    if (status) {
      query += ` WHERE eo.status = $1`;
      values.push(status);
    }
    
    query += ` ORDER BY eo.created_at DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
    
  } catch (error) {
    console.error('Get employee onboarding records error:', error);
    throw error;
  }
};

module.exports = {
  // Role change requests
  createRoleChangeRequest,
  getRoleChangeRequests,
  approveRoleChangeRequest,
  rejectRoleChangeRequest,
  
  // Audit trail
  logRoleChange,
  getRoleChangeHistory,
  
  // Employee onboarding
  createEmployeeOnboarding,
  completeEmployeeOnboarding,
  getEmployeeOnboardingRecords
};
