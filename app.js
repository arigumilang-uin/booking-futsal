const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const {
  helmetConfig,
  generalRateLimit,
  validateInput,
  securityLogger,
  corsSecurityCheck,
  requestSizeLimit
} = require('./middlewares/security/securityMiddleware');

// Import Swagger configuration
const { specs, swaggerUi, swaggerUiOptions } = require('./config/swagger');

const apiRoutes = require('./routes/indexRoutes');

const app = express();

// Trust proxy for Railway deployment
// Railway uses reverse proxy, so we need to trust the proxy
app.set('trust proxy', true);

app.use(helmetConfig);
app.use(compression());
app.use(requestSizeLimit('10mb'));
app.use(securityLogger);
app.use(corsSecurityCheck);
app.use(generalRateLimit);
app.use(validateInput);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'https://booking-futsal-frontend.vercel.app',
  'https://booking-futsal-production.up.railway.app'
];

console.log('🔧 CORS Configuration:');
console.log('📋 Allowed Origins:', allowedOrigins);
console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🚀 Server starting with enhanced CORS support...');

// Simple and robust CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔍 CORS Check - Origin:', origin);

    // Allow requests with no origin (like mobile apps, Postman, Swagger UI)
    if (!origin) {
      console.log('✅ CORS: No origin - allowing');
      callback(null, true);
      return;
    }

    // Check allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin allowed -', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Origin blocked -', origin);
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Accept', 'Origin', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Explicit preflight handling for all routes
app.options('*', cors(corsOptions));



app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Futsal Booking API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    documentation: {
      swagger: '/api-docs',
      description: 'API Documentation menggunakan Swagger/OpenAPI 3.0'
    }
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// OpenAPI JSON Specification endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(specs);
});

// OpenAPI YAML Specification endpoint (optional)
app.get('/api-docs.yaml', (req, res) => {
  const yaml = require('js-yaml');
  res.setHeader('Content-Type', 'application/x-yaml');
  res.send(yaml.dump(specs));
});

// Enhanced health endpoint dengan performance metrics
app.get('/health', async (req, res) => {
  try {
    const pool = require('./config/db');
    const { getSummary } = require('./utils/performanceMonitor');

    // Test database connection
    const dbStart = Date.now();
    const dbResult = await pool.query('SELECT NOW() as current_time, version() as db_version');
    const dbResponseTime = Date.now() - dbStart;

    // Get performance metrics
    const perfMetrics = getSummary();

    // Get memory usage
    const memUsage = process.memoryUsage();

    // Get system info
    const os = require('os');

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0',
      uptime: {
        seconds: Math.floor(process.uptime()),
        human: formatUptime(process.uptime())
      },
      database: {
        status: 'connected',
        responseTime: dbResponseTime,
        version: dbResult.rows[0].db_version.split(' ')[0]
      },
      performance: perfMetrics,
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        unit: 'MB'
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        cpuCount: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024),
        freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024),
        loadAverage: os.loadavg().map(load => Math.round(load * 100) / 100),
        unit: 'GB'
      },
      features: {
        swagger: true,
        gracefulShutdown: true,
        structuredLogging: true,
        performanceMonitoring: true,
        environmentValidation: true
      }
    };

    res.json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function untuk format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// Add audit logging middleware for all API routes
const { auditLogger } = require('./middlewares/auditLogger');
app.use('/api', auditLogger({
  excludePaths: ['/api/auth/verify', '/api/health', '/api/status', '/api/staff/supervisor/system-health', '/api/staff/supervisor/database-stats'],
  excludeMethods: ['OPTIONS', 'GET'],
  logSuccessOnly: true
}));

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Use centralized error handler
const { errorHandler } = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
