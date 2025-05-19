const User = require('../../models/userModel');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.getUserById(req.user.id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data profil' });
  }
};
