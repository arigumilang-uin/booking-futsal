const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const { verifyToken } = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin'); // perbaikan disini

// GET semua lapangan (public)
router.get('/', fieldController.getAllFields);

// GET satu lapangan berdasarkan ID (public)
router.get('/:id', fieldController.getFieldById);

// POST tambah lapangan (admin only)
router.post('/', verifyToken, isAdmin, fieldController.createField);

// PUT update lapangan (admin only)
router.put('/:id', verifyToken, isAdmin, fieldController.updateField);

// DELETE hapus lapangan (admin only)
router.delete('/:id', verifyToken, isAdmin, fieldController.deleteField);

module.exports = router;
