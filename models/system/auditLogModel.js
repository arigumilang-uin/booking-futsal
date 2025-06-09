const pool = require('../../config/db');

// Create audit log entry
const createAuditLog = async ({
  user_id,
  action,
  resource_type,
  table_name,
  resource_id,
  old_values = null,
  new_values = null,
  ip_address = null,
  user_agent = null,
  additional_info = null
}) => {
  const query = `
    INSERT INTO audit_logs (
      user_id, action, resource_type, table_name, resource_id, old_values, new_values,
      ip_address, user_agent, additional_info
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, uuid, user_id, action, resource_type, table_name, resource_id,
              old_values, new_values, ip_address, user_agent, additional_info, created_at
  `;
  const values = [
    user_id, action, resource_type, table_name || resource_type, resource_id,
    old_values ? JSON.stringify(old_values) : null,
    new_values ? JSON.stringify(new_values) : null,
    ip_address, user_agent,
    additional_info ? JSON.stringify(additional_info) : null
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get audit logs with pagination
const getAuditLogs = async (page = 1, limit = 50, filters = {}) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT al.id, al.uuid, al.user_id, al.action, al.resource_type, al.resource_id,
           al.old_values, al.new_values, al.ip_address, al.user_agent,
           al.additional_info, al.created_at,
           u.name as user_name, u.email as user_email, u.role as user_role
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  // Apply filters
  if (filters.user_id) {
    query += ` AND al.user_id = $${paramCount++}`;
    params.push(filters.user_id);
  }

  if (filters.action) {
    query += ` AND al.action = $${paramCount++}`;
    params.push(filters.action);
  }

  if (filters.resource_type) {
    query += ` AND al.resource_type = $${paramCount++}`;
    params.push(filters.resource_type);
  }

  if (filters.table_name) {
    query += ` AND al.table_name = $${paramCount++}`;
    params.push(filters.table_name);
  }

  if (filters.resource_id) {
    query += ` AND al.resource_id = $${paramCount++}`;
    params.push(filters.resource_id);
  }

  if (filters.date_from) {
    query += ` AND al.created_at >= $${paramCount++}`;
    params.push(filters.date_from);
  }

  if (filters.date_to) {
    query += ` AND al.created_at <= $${paramCount++}`;
    params.push(filters.date_to);
  }

  query += ` ORDER BY al.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

// Get audit log by ID
const getAuditLogById = async (id) => {
  const query = `
    SELECT al.id, al.uuid, al.user_id, al.action, al.resource_type, al.resource_id,
           al.old_values, al.new_values, al.ip_address, al.user_agent,
           al.additional_info, al.created_at,
           u.name as user_name, u.email as user_email, u.role as user_role
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Get audit logs for specific resource
const getResourceAuditLogs = async (resourceType, resourceId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT al.id, al.uuid, al.user_id, al.action, al.resource_type, al.resource_id,
           al.old_values, al.new_values, al.ip_address, al.user_agent,
           al.additional_info, al.created_at,
           u.name as user_name, u.email as user_email, u.role as user_role
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.resource_type = $1 AND al.resource_id = $2
    ORDER BY al.created_at DESC
    LIMIT $3 OFFSET $4
  `;
  const result = await pool.query(query, [resourceType, resourceId, limit, offset]);
  return result.rows;
};

// Get user activity logs
const getUserActivityLogs = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT al.id, al.uuid, al.user_id, al.action, al.resource_type, al.resource_id,
           al.old_values, al.new_values, al.ip_address, al.user_agent,
           al.additional_info, al.created_at
    FROM audit_logs al
    WHERE al.user_id = $1
    ORDER BY al.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

// Get audit statistics
const getAuditStatistics = async (days = 30) => {
  try {
    // Use parameterized query to avoid SQL injection
    const allTimeQuery = `
      SELECT
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT COALESCE(resource_type, table_name)) as resource_types,
        COUNT(CASE WHEN action = 'CREATE' THEN 1 END) as create_actions,
        COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as update_actions,
        COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as delete_actions,
        COUNT(CASE WHEN action = 'LOGIN' THEN 1 END) as login_actions,
        COUNT(CASE WHEN action = 'LOGOUT' THEN 1 END) as logout_actions
      FROM audit_logs
    `;

    const todayQuery = `
      SELECT
        COUNT(*) as today_logs,
        COUNT(DISTINCT user_id) as today_unique_users
      FROM audit_logs
      WHERE DATE(created_at) = CURRENT_DATE
    `;

    const criticalQuery = `
      SELECT
        COUNT(*) as critical_actions
      FROM audit_logs
      WHERE action IN ('DELETE', 'LOGIN_FAILED', 'MANUAL_AUTO_COMPLETION_TRIGGER')
      AND created_at >= CURRENT_DATE - INTERVAL $1 || ' days'
    `;

    const [allTimeResult, todayResult, criticalResult] = await Promise.all([
      pool.query(allTimeQuery),
      pool.query(todayQuery),
      pool.query(criticalQuery, [days])
    ]);

    const allTime = allTimeResult.rows[0];
    const today = todayResult.rows[0];
    const critical = criticalResult.rows[0];

    return {
      total_logs: parseInt(allTime.total_logs) || 0,
      today_logs: parseInt(today.today_logs) || 0,
      unique_users: parseInt(allTime.unique_users) || 0,
      today_unique_users: parseInt(today.today_unique_users) || 0,
      critical_actions: parseInt(critical.critical_actions) || 0,
      resource_types: parseInt(allTime.resource_types) || 0,
      create_actions: parseInt(allTime.create_actions) || 0,
      update_actions: parseInt(allTime.update_actions) || 0,
      delete_actions: parseInt(allTime.delete_actions) || 0,
      login_actions: parseInt(allTime.login_actions) || 0,
      logout_actions: parseInt(allTime.logout_actions) || 0
    };
  } catch (error) {
    console.error('Audit statistics query error:', error);
    // Return fallback data
    return {
      total_logs: 0,
      today_logs: 0,
      unique_users: 0,
      today_unique_users: 0,
      critical_actions: 0,
      resource_types: 0,
      create_actions: 0,
      update_actions: 0,
      delete_actions: 0,
      login_actions: 0,
      logout_actions: 0
    };
  }
};

// Get activity by action type
const getActivityByAction = async (days = 30) => {
  const query = `
    SELECT
      action,
      COUNT(*) as count,
      COUNT(DISTINCT user_id) as unique_users
    FROM audit_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY action
    ORDER BY count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get activity by resource type
const getActivityByResourceType = async (days = 30) => {
  const query = `
    SELECT
      resource_type,
      COUNT(*) as count,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(CASE WHEN action = 'CREATE' THEN 1 END) as creates,
      COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as updates,
      COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as deletes
    FROM audit_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY resource_type
    ORDER BY count DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Get daily activity
const getDailyActivity = async (days = 30) => {
  const query = `
    SELECT
      DATE(created_at) as date,
      COUNT(*) as total_actions,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(CASE WHEN action = 'LOGIN' THEN 1 END) as logins
    FROM audit_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Clean old audit logs
const cleanOldAuditLogs = async (retentionDays = 365) => {
  try {
    const query = `
      DELETE FROM audit_logs
      WHERE created_at < CURRENT_DATE - INTERVAL $1 || ' days'
    `;
    const result = await pool.query(query, [retentionDays]);
    return result.rowCount || 0;
  } catch (error) {
    console.error('Clean old audit logs error:', error);
    throw error;
  }
};

// Log user login
const logUserLogin = async (userId, ipAddress, userAgent, success = true) => {
  return await createAuditLog({
    user_id: userId,
    action: success ? 'LOGIN' : 'LOGIN_FAILED',
    resource_type: 'user',
    table_name: 'users',
    resource_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    additional_info: { success, timestamp: new Date().toISOString() }
  });
};

// Log user logout
const logUserLogout = async (userId, ipAddress, userAgent) => {
  return await createAuditLog({
    user_id: userId,
    action: 'LOGOUT',
    resource_type: 'user',
    table_name: 'users',
    resource_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    additional_info: { timestamp: new Date().toISOString() }
  });
};

// Log resource change
const logResourceChange = async (userId, action, resourceType, resourceId, oldValues, newValues, ipAddress, userAgent) => {
  return await createAuditLog({
    user_id: userId,
    action: action.toUpperCase(),
    resource_type: resourceType,
    table_name: `${resourceType}s`,
    resource_id: resourceId,
    old_values: oldValues,
    new_values: newValues,
    ip_address: ipAddress,
    user_agent: userAgent
  });
};

// Get most active users
const getMostActiveUsers = async (days = 30, limit = 10) => {
  const query = `
    SELECT
      al.user_id,
      u.name as user_name,
      u.email as user_email,
      u.role as user_role,
      COUNT(*) as activity_count,
      COUNT(CASE WHEN al.action = 'LOGIN' THEN 1 END) as login_count,
      MAX(al.created_at) as last_activity
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY al.user_id, u.name, u.email, u.role
    ORDER BY activity_count DESC
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getAuditLogById,
  getResourceAuditLogs,
  getUserActivityLogs,
  getAuditStatistics,
  getActivityByAction,
  getActivityByResourceType,
  getDailyActivity,
  cleanOldAuditLogs,
  logUserLogin,
  logUserLogout,
  logResourceChange,
  getMostActiveUsers
};
