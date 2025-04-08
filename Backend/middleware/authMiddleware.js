// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and starts with 'Bearer'
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No valid token provided' });
  }

  // Extract token after 'Bearer '
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Token missing' });
  }

  try {
    // Verify token with JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database, excluding password
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Attach full user object to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token has expired' });
    }
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

module.exports = authMiddleware;