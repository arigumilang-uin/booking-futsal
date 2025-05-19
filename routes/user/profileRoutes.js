// 📁 routes/user/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/user/profileController');
const { verifyToken } = require('../../middlewares/authMiddleware');

router.get('/me', verifyToken, profileController.getProfile);

module.exports = router;
