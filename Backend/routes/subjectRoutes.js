// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { getSubjects, addSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getSubjects);
router.post('/', authMiddleware, addSubject);
router.put('/:id', authMiddleware, updateSubject);
router.delete('/:id', authMiddleware, deleteSubject);

module.exports = router;
