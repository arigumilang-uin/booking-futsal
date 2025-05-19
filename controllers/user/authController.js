const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const { generateToken } = require('../../utils/tokenUtils');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.createUser({ name, email, password: hashedPassword });

    const token = generateToken(newUser);
    res.status(201).json({ user: newUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Gagal registrasi pengguna' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Password salah' });

    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Gagal login' });
  }
};
