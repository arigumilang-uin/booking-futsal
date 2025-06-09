const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? {
    rejectUnauthorized: false,
  } : false,
});

pool.on('connect', () => {
  console.log(`✅ Connected to ${isProduction ? 'production' : 'development'} database`);
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return {
      success: true,
      timestamp: result.rows[0].now,
      environment: isProduction ? 'production' : 'development'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const getDatabaseStats = async () => {
  try {
    const client = await pool.connect();

    // Fixed query - using correct column names
    const tablesQuery = `
      SELECT
        schemaname,
        relname as table_name,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) as table_size
      FROM pg_stat_user_tables
      ORDER BY relname
    `;
    const tablesResult = await client.query(tablesQuery);

    const sizeQuery = `
      SELECT
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        current_database() as database_name
    `;
    const sizeResult = await client.query(sizeQuery);

    const connectionsQuery = `
      SELECT
        count(*) as total_connections,
        count(*) filter (where state = 'active') as active_connections,
        count(*) filter (where state = 'idle') as idle_connections,
        count(*) filter (where state = 'idle in transaction') as idle_in_transaction
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;
    const connectionsResult = await client.query(connectionsQuery);

    // Additional database info
    const dbInfoQuery = `
      SELECT
        version() as postgres_version,
        current_setting('server_version') as server_version,
        current_setting('max_connections') as max_connections
    `;
    const dbInfoResult = await client.query(dbInfoQuery);

    client.release();

    return {
      success: true,
      database_info: {
        ...sizeResult.rows[0],
        ...dbInfoResult.rows[0]
      },
      connections: connectionsResult.rows[0],
      tables: tablesResult.rows,
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Database stats error:', error);
    return {
      success: false,
      error: error.message,
      generated_at: new Date().toISOString()
    };
  }
};

const healthCheck = async () => {
  try {
    const client = await pool.connect();
    const start = Date.now();
    await client.query('SELECT 1');
    const duration = Date.now() - start;

    // Get additional database info
    const versionResult = await client.query('SELECT version()');
    const connectionsResult = await client.query('SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = \'active\'');

    client.release();

    // Determine health status based on response time
    let healthStatus = 'excellent';
    if (duration > 100) healthStatus = 'good';
    if (duration > 500) healthStatus = 'warning';
    if (duration > 1000) healthStatus = 'critical';

    return {
      status: 'healthy',
      health_level: healthStatus,
      database: 'connected',
      response_time: `${duration}ms`,
      response_time_ms: duration,
      database_version: versionResult.rows[0].version.split(' ')[1],
      active_connections: parseInt(connectionsResult.rows[0].active_connections),
      pool_info: {
        total_count: pool.totalCount,
        idle_count: pool.idleCount,
        waiting_count: pool.waitingCount
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      status: 'unhealthy',
      health_level: 'critical',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  ...pool,
  query: pool.query.bind(pool),
  connect: pool.connect.bind(pool),
  end: pool.end.bind(pool),
  testConnection,
  getDatabaseStats,
  healthCheck
};
