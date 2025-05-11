const fieldModel = require('../models/fieldModel');

exports.getAllFields = async (req, res) => {
  try {
    const fields = await fieldModel.getAllFields(); // Tanpa pagination untuk sekarang
    if (fields.length === 0) {
      return res.status(404).json({ message: 'Tidak ada lapangan ditemukan' });
    }
    res.json(fields);
  } catch (err) {
    console.error('Error getAllFields:', err);
    res.status(500).json({ error: 'Gagal mengambil data lapangan' });
  }
};

exports.getFieldById = async (req, res) => {
  const { id } = req.params;
  try {
    const field = await fieldModel.getFieldById(id);
    if (!field) {
      return res.status(404).json({ message: 'Lapangan tidak ditemukan' });
    }
    res.json(field);
  } catch (err) {
    console.error('Error getFieldById:', err);
    res.status(500).json({ error: 'Gagal mengambil detail lapangan' });
  }
};

exports.createField = async (req, res) => {
  const { name, type, price, image_url, status } = req.body;

  if (!name || !type || !price || !image_url) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }
  if (typeof price !== 'number') {
    return res.status(400).json({ error: 'Harga harus berupa angka' });
  }

  try {
    const newField = await fieldModel.createField({ name, type, price, image_url, status });
    res.status(201).json(newField);
  } catch (err) {
    console.error('Error createField:', err);
    res.status(500).json({ error: 'Gagal menambahkan lapangan' });
  }
};

exports.updateField = async (req, res) => {
  const { id } = req.params;
  const { name, type, price, image_url, status } = req.body;

  try {
    const existingField = await fieldModel.getFieldById(id);
    if (!existingField) {
      return res.status(404).json({ message: 'Lapangan tidak ditemukan' });
    }

    const updatedField = await fieldModel.updateField(id, {
      name,
      type,
      price,
      image_url,
      status,
    });

    res.json(updatedField);
  } catch (err) {
    console.error('Error updateField:', err);
    res.status(500).json({ error: 'Gagal memperbarui lapangan' });
  }
};

exports.deleteField = async (req, res) => {
  const { id } = req.params;

  try {
    const existingField = await fieldModel.getFieldById(id);
    if (!existingField) {
      return res.status(404).json({ message: 'Lapangan tidak ditemukan' });
    }

    await fieldModel.deleteField(id);
    res.json({ message: 'Lapangan berhasil dihapus' });
  } catch (err) {
    console.error('Error deleteField:', err);
    res.status(500).json({ error: 'Gagal menghapus lapangan' });
  }
};
