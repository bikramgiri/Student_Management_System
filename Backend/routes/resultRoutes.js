// routes/resultRoutes.js
const express = require('express');
const router = express.Router();
const { submitResult, getStudentResults } = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware,submitResult);
router.get('/student', authMiddleware, getStudentResults);

module.exports = router;