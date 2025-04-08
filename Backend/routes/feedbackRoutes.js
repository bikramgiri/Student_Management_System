// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const { submitFeedback, updateFeedbackStatus, getFeedbacks } = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, submitFeedback);
router.put('/:id', authMiddleware, updateFeedbackStatus);
router.get('/', authMiddleware, getFeedbacks);

module.exports = router;