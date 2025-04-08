// routes/leaveRoutes.js
const express = require('express');
const router = express.Router();
const { submitLeave } = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, submitLeave);

module.exports = router;