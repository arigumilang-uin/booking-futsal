const pool = require('../../config/db');

exports.getAllPayments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY paid_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data pembayaran' });
  }
};

exports.getPaymentById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil detail pembayaran' });
  }
};

exports.deletePayment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [id]);
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan atau sudah dihapus' });
    }
    res.json({ message: 'Pembayaran berhasil dihapus', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus pembayaran' });
  }
};

