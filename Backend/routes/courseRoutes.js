// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { getCourses, addCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getCourses);
router.post('/', authMiddleware, addCourse);
router.put('/:id', authMiddleware, updateCourse);
router.delete('/:id', authMiddleware, deleteCourse);

module.exports = router;
