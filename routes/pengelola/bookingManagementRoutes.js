// 📁 routes/pengelola/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingManagementController = require('../../controllers/pengelola/bookingManagementController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const isPengelola = require('../../middlewares/isPengelola');

router.put('/:id/status', verifyToken, isPengelola, bookingManagementController.updateBookingStatus);

module.exports = router;
