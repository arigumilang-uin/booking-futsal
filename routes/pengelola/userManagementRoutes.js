// 📁 routes/pengelola/userManagementRoutes.js
const express = require('express');
const router = express.Router();
const userManagementController = require('../../controllers/pengelola/userManagementController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const isPengelola = require('../../middlewares/isPengelola');

router.get('/users', verifyToken, isPengelola, userManagementController.getAllUsers);
router.delete('/users/:id', verifyToken, isPengelola, userManagementController.deleteUserById);

module.exports = router;
