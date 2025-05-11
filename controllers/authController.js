const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { generateToken } = require('../utils/tokenUtils');

// Register
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
    console.error(err);
    res.status(500).json({ error: 'Gagal registrasi pengguna' });
  }
};

// Login
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
    console.error(err);
    res.status(500).json({ error: 'Gagal login' });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.getUserById(req.user.id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data profil' });
  }
};

// Get All Users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil daftar pengguna' });
  }
};
