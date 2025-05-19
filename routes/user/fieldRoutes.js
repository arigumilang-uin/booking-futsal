// 📁 routes/user/fieldRoutes.js
const express = require('express');
const router = express.Router();
const fieldController = require('../../controllers/user/fieldController');

router.get('/', fieldController.getAllFields);
router.get('/:id', fieldController.getFieldById);

module.exports = router;
