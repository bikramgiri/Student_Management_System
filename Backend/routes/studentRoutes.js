// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { getStudents, addStudent, updateStudent, deleteStudent, getPotentialStudents } = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getStudents);
router.post('/', authMiddleware, addStudent);
router.put('/:id', authMiddleware, updateStudent);
router.delete('/:id', authMiddleware, deleteStudent);
router.get('/potential', authMiddleware, getPotentialStudents); // Add this

module.exports = router;
