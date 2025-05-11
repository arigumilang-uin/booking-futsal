const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middlewares/authMiddleware').verifyToken;
const isAdmin = require('../middlewares/isAdmin');

// USER: Ambil semua booking miliknya
router.get('/', verifyToken, bookingController.getUserBookings);

// USER: Buat booking
router.post('/', verifyToken, bookingController.createBooking);

// ADMIN: Ubah status booking (approved/rejected/etc)
router.put('/:id/status', verifyToken, isAdmin, bookingController.updateBookingStatus);

// USER: Batalkan booking miliknya sendiri
router.delete('/:id', verifyToken, bookingController.cancelBooking);

module.exports = router;
