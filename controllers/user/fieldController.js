const fieldModel = require('../../models/fieldModel');

exports.getAllFields = async (req, res) => {
  try {
    const fields = await fieldModel.getAllFields();
    res.status(200).json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data lapangan', error });
  }
};

exports.getFieldById = async (req, res) => {
  try {
    const field = await fieldModel.getFieldById(req.params.id);
    if (!field) return res.status(404).json({ message: 'Lapangan tidak ditemukan' });
    res.status(200).json(field);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data lapangan', error });
  }
};
