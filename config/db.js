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

    const tablesQuery = `
      SELECT
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples
      FROM pg_stat_user_tables
      ORDER BY tablename
    `;
    const tablesResult = await client.query(tablesQuery);

    const sizeQuery = `
      SELECT pg_size_pretty(pg_database_size(current_database())) as database_size
    `;
    const sizeResult = await client.query(sizeQuery);

    const connectionsQuery = `
      SELECT
        count(*) as total_connections,
        count(*) filter (where state = 'active') as active_connections,
        count(*) filter (where state = 'idle') as idle_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;
    const connectionsResult = await client.query(connectionsQuery);

    client.release();

    return {
      success: true,
      database_size: sizeResult.rows[0].database_size,
      connections: connectionsResult.rows[0],
      tables: tablesResult.rows
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const healthCheck = async () => {
  try {
    const client = await pool.connect();
    const start = Date.now();
    await client.query('SELECT 1');
    const duration = Date.now() - start;
    client.release();

    return {
      status: 'healthy',
      response_time: `${duration}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
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
