const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
// const adminBookingRoutes = require('./routes/admin/bookingRoutes'); // jika nanti ada admin khusus

const app = express();

// Middleware umum
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
// app.use('/api/admin/bookings', adminBookingRoutes); // contoh admin khusus

// Middleware 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Middleware untuk error global
app.use(errorMiddleware);

module.exports = app;
