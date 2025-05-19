const Booking = require('../../models/bookingModel');

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
