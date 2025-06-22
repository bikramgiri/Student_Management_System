const express = require('express');
const router = express.Router();
const { submitStudentLeave, submitTeacherLeave, getStudentLeaves, getAllLeaves, updateLeaveStatus, deleteLeave, updateTeacherLeave, updateStudentLeave } = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, submitStudentLeave); // For students
router.post('/teacher', authMiddleware, submitTeacherLeave); // For teachers
router.get('/student', authMiddleware, getStudentLeaves);
router.get('/', authMiddleware, getAllLeaves);
router.put('/:id', authMiddleware, updateLeaveStatus);
router.put('/teacher/:id', authMiddleware, updateTeacherLeave); // New route for teacher updates
router.put('/student/:id', authMiddleware, updateStudentLeave); // For students
router.delete('/:id', authMiddleware, deleteLeave);

module.exports = router;