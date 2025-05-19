// 📁 routes/pengelola/fieldRoutes.js
const express = require('express');
const router = express.Router();
const fieldController = require('../../controllers/pengelola/fieldController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const isPengelola = require('../../middlewares/isPengelola');

router.post('/', verifyToken, isPengelola, fieldController.createField);
router.put('/:id', verifyToken, isPengelola, fieldController.updateField);
router.delete('/:id', verifyToken, isPengelola, fieldController.deleteField);

module.exports = router;
