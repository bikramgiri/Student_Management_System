// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { submitAttendance } = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, submitAttendance);

module.exports = router;