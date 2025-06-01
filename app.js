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

const enhancedRoutes = require('./routes/enhanced/index');

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
  'http://localhost:5173',
  'https://booking-futsal-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Futsal Booking API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', enhancedRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);

  const isDev = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
    ...(isDev && { stack: err.stack })
  });
});

module.exports = app;
