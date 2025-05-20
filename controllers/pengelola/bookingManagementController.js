// controllers/pengelola/bookingManagementController.js
const Booking = require('../../models/bookingModel');

exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid' });
  }

  try {
    const updatedBooking = await Booking.updateBookingStatus(id, status);
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }
    res.json(updatedBooking);
  } catch (err) {
    console.error('Update Error:', err.message);
    res.status(500).json({ error: 'Gagal mengubah status booking' });
  }
};

exports.deleteBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.getBookingById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan' });
    }

    await Booking.deleteBooking(id);
    res.status(200).json({ message: 'Booking berhasil dihapus' });
  } catch (err) {
    console.error('Delete Error:', err.message);
    res.status(500).json({ error: 'Gagal menghapus booking' });
  }
};
