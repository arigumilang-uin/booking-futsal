const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Tambahan:
router.get('/me', verifyToken, authController.getProfile); // user profile
router.get('/users', verifyToken, isAdmin, authController.getAllUsers); // admin only
router.delete('/users/:id', verifyToken, isAdmin, authController.deleteUserById); // hapus user (admin only)

module.exports = router;
