// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login, fetchAdminProfile, updateAdminProfile, updateUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', authMiddleware, fetchAdminProfile);
router.put('/profile', authMiddleware, updateAdminProfile);
router.put('/:userId', authMiddleware, updateUser);

module.exports = router;
