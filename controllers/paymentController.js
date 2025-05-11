const pool = require('../config/db');

// Create a payment (user only)
exports.createPayment = async (req, res) => {
  const { booking_id, method, amount } = req.body;

  if (!booking_id || !method || !amount) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert payment
    const paymentResult = await client.query(
      'INSERT INTO payments (booking_id, method, amount, status, paid_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [booking_id, method, amount, 'paid']
    );

    // Update booking status
    await client.query(
      'UPDATE bookings SET status = $1 WHERE id = $2',
      ['confirmed', booking_id]
    );

    await client.query('COMMIT');
    res.status(201).json(paymentResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error createPayment:', err);
    res.status(500).json({ error: 'Gagal memproses pembayaran', details: err.message });
  } finally {
    client.release();
  }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY paid_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getAllPayments:', err);
    res.status(500).json({ error: 'Gagal mengambil data pembayaran' });
  }
};

// Get payment by ID (admin only)
exports.getPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getPaymentById:', err);
    res.status(500).json({ error: 'Gagal mengambil detail pembayaran' });
  }
};

// Delete payment (admin only)
exports.deletePayment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [id]);
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
    }
    res.json({ message: 'Pembayaran berhasil dihapus' });
  } catch (err) {
    console.error('Error deletePayment:', err);
    res.status(500).json({ error: 'Gagal menghapus pembayaran' });
  }
};
