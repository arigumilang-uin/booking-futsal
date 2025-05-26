const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Import semua user routes dari folder routes/user
const authRoutes = require('./routes/user/authRoutes');
const fieldRoutes = require('./routes/user/fieldRoutes');
const bookingRoutes = require('./routes/user/bookingRoutes');
const paymentRoutes = require('./routes/user/paymentRoutes');
const profileRoutes = require('./routes/user/profileRoutes');

const bookingManagementRoutes = require('./routes/pengelola/bookingManagementRoutes');
const fieldManagementRoutes = require('./routes/pengelola/fieldManagementRoutes');
const paymentManagementRoutes = require('./routes/pengelola/paymentManagementRoutes');
const userManagementRoutes = require('./routes/pengelola/userManagementRoutes');

const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// Middleware umum
const allowedOrigins = [
  'http://localhost:5173', //development
  'https://booking-futsal-frontend.vercel.app' //production
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));


app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Route root untuk cek server aktif
app.get('/', (req, res) => {
  res.send('Booking Futsal API is running 🚀');
});

// Routes untuk pengguna
app.use('/user/auth', authRoutes);
app.use('/user/fields', fieldRoutes);
app.use('/user/bookings', bookingRoutes);
app.use('/user/payments', paymentRoutes);
app.use('/user/profile', profileRoutes);

app.use('/pengelola/bookings', bookingManagementRoutes);
app.use('/pengelola/fields', fieldManagementRoutes);
app.use('/pengelola/payments', paymentManagementRoutes);
app.use('/pengelola/users', userManagementRoutes);

// Middleware 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Middleware error global
app.use(errorMiddleware);

module.exports = app;
