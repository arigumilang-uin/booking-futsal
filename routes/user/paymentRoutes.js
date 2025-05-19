// 📁 routes/user/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/user/paymentController');
const { verifyToken } = require('../../middlewares/authMiddleware');

router.post('/', verifyToken, paymentController.createPayment);

module.exports = router;
