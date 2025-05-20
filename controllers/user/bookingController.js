// controllers/user/bookingController.js
const Booking = require('../../models/bookingModel');
const { isTimeOverlap } = require('../../utils/dateUtils');

exports.getUserBookings = async (req, res) => {
  const userId = req.user.id;

  try {
    const bookings = await Booking.getBookingsByUserId(userId);
    if (!bookings.length) {
      return res.status(404).json({ message: 'Tidak ada booking ditemukan' });
    }
    res.json(bookings);
  } catch (err) {
    console.error('Fetch Error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data booking' });
  }
};

exports.createBooking = async (req, res) => {
  const userId = req.user.id;
  const { field_id, date, start_time, end_time, name, phone } = req.body;

  try {
    // Cek konflik booking
    const conflict = await Booking.checkBookingConflict({ field_id, date, start_time, end_time });
    if (conflict) {
      return res.status(400).json({ error: 'Waktu sudah terpakai' });
    }

    const newBooking = await Booking.createBooking({
      user_id: userId,
      field_id,
      date,
      start_time,
      end_time,
      name,
      phone,
    });

    res.status(201).json(newBooking);
  } catch (err) {
    console.error('Create Booking Error:', err.message);
    res.status(500).json({ error: 'Gagal membuat booking' });
  }
};

exports.cancelBooking = async (req, res) => {
  const userId = req.user.id;
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
    console.error('Cancel Booking Error:', err.message);
    res.status(500).json({ error: 'Gagal membatalkan booking' });
  }
};
