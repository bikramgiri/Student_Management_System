// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { submitAttendance, getStudentAttendance,getAttendanceSummary, updateAttendance, deleteAttendance, getTeacherAttendance, getAdminAttendanceSummary } = require('../controllers/attendanceController'); // Import both functions
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, submitAttendance);
router.get('/student', authMiddleware, getStudentAttendance);
router.get('/summary', authMiddleware, getAttendanceSummary);
router.get('/summary/admin', authMiddleware, getAdminAttendanceSummary); // New admin endpoint
router.get('/teacher', authMiddleware, getTeacherAttendance);
router.put('/:attId', authMiddleware, updateAttendance);
router.delete('/:attId', authMiddleware, deleteAttendance);

module.exports = router;