const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

// POST pembayaran (user)
router.post('/', verifyToken, paymentController.createPayment);

// [Optional] GET semua pembayaran (admin only)
router.get('/', verifyToken, isAdmin, paymentController.getAllPayments);

// [Optional] GET detail pembayaran berdasarkan ID (admin only)
router.get('/:id', verifyToken, isAdmin, paymentController.getPaymentById);

// [Optional] DELETE pembayaran (admin only)
router.delete('/:id', verifyToken, isAdmin, paymentController.deletePayment);

module.exports = router;
