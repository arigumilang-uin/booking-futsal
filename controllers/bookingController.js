const pool = require('../config/db');
const Booking = require('../models/bookingModel');
const { isTimeOverlap } = require('../utils/dateUtils');

exports.getUserBookings = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY date, start_time',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tidak ada booking ditemukan' });
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data booking' });
  }
};

exports.createBooking = async (req, res) => {
  const userId = req.user.userId;
  const { field_id, date, start_time, end_time } = req.body;
  try {
    const existingBookings = await pool.query(
      'SELECT * FROM bookings WHERE field_id = $1 AND date = $2',
      [field_id, date]
    );
    for (let booking of existingBookings.rows) {
      if (isTimeOverlap(booking.start_time, booking.end_time, start_time, end_time)) {
        return res.status(400).json({ error: 'Waktu sudah terpakai' });
      }
    }

    const result = await pool.query(
      'INSERT INTO bookings (user_id, field_id, date, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, field_id, date, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat booking' });
  }
};

// Admin: ubah status booking
exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid' });
  }

  try {
    const updated = await Booking.updateBookingStatus(id, status);
    if (!updated) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengubah status booking' });
  }
};

// User: batalkan booking miliknya
exports.cancelBooking = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const booking = await Booking.getBookingById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    if (booking.user_id !== userId) {
      return res.status(403).json({ error: 'Tidak diizinkan membatalkan booking ini' });
    }

    await Booking.deleteBooking(id);
    res.json({ message: 'Booking berhasil dibatalkan' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal membatalkan booking' });
  }
};
