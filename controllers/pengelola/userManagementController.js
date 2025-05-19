const User = require('../../models/userModel');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil daftar pengguna' });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.deleteUserById(userId);
    res.status(200).json({ message: 'User berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus user' });
  }
};
