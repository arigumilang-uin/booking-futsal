// 📁 routes/pengelola/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentManagementController = require('../../controllers/pengelola/paymentManagementController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const isPengelola = require('../../middlewares/isPengelola');

router.get('/', verifyToken, isPengelola, paymentManagementController.getAllPayments);
router.get('/:id', verifyToken, isPengelola, paymentManagementController.getPaymentById);
router.delete('/:id', verifyToken, isPengelola, paymentManagementController.deletePayment);

module.exports = router;
