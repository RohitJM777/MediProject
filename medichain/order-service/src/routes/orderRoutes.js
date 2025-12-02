const express = require('express');
const router = express.Router();
const { uploadPrescription } = require('../controllers/orderController');

router.post('/upload-prescription', uploadPrescription);

module.exports = router;
