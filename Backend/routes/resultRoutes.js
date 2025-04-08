// routes/resultRoutes.js
const express = require('express');
const router = express.Router();
const { submitResult } = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware,submitResult);

module.exports = router;