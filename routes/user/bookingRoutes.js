// 📁 routes/user/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/user/bookingController');
const { verifyToken } = require('../../middlewares/authMiddleware');

router.get('/', verifyToken, bookingController.getUserBookings);
router.post('/', verifyToken, bookingController.createBooking);
router.delete('/:id', verifyToken, bookingController.cancelBooking);

module.exports = router;
