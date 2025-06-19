// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login, fetchProfile, updateProfile, updateUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', authMiddleware, fetchProfile);
router.put('/profile', authMiddleware, updateProfile); // Unified endpoint
router.put('/:userId', authMiddleware, updateUser);

module.exports = router;