// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { submitAttendance, getStudentAttendance,getAttendanceSummary } = require('../controllers/attendanceController'); // Import both functions
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, submitAttendance);
router.get('/student', authMiddleware, getStudentAttendance);
router.get('/summary', authMiddleware, getAttendanceSummary);

module.exports = router;