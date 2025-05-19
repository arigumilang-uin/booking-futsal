const pool = require('../../config/db');

exports.createPayment = async (req, res) => {
  const { booking_id, method, amount } = req.body;

  if (!booking_id || !method || !amount) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const paymentResult = await client.query(
      'INSERT INTO payments (booking_id, method, amount, status, paid_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [booking_id, method, amount, 'paid']
    );

    await client.query(
      'UPDATE bookings SET status = $1 WHERE id = $2',
      ['confirmed', booking_id]
    );

    await client.query('COMMIT');
    res.status(201).json(paymentResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Gagal memproses pembayaran', details: err.message });
  } finally {
    client.release();
  }
};
