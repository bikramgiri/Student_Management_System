const express = require('express');
const router = express.Router();
const { submitResult, getTeacherResults, getStudentResults, getResultSummary, deleteResult, getAllResults } = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, submitResult);
router.get('/teacher', authMiddleware, getTeacherResults); // New endpoint for teachers
router.get('/student', authMiddleware, getStudentResults);
router.get('/average-marks', authMiddleware, getResultSummary);
router.get('/all', authMiddleware, getAllResults); // Added for admin access
router.delete('/:id', authMiddleware, deleteResult);

module.exports = router;