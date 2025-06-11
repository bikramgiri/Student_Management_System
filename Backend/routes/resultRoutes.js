// routes/resultRoutes.js
const express = require('express');
const router = express.Router();
const { submitResult, getStudentResults, getResultSummary } = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware,submitResult);
router.get('/student', authMiddleware, getStudentResults);
router.get('/average-marks', authMiddleware, getResultSummary);

module.exports = router;