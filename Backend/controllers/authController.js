// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// controllers/authController.js
exports.signup = async (req, res) => {
  console.log('Signup request received with body:', req.body);
  try {
    const { name, email, password, role, address, subjects, theme } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields (name, email, password, role) are required' });
    }

    // Check for existing user with the same email and role
    const existingUser = await User.findOne({ email, role });
    if (existingUser) {
      return res.status(400).json({ message: `Email ${email} already registered for role ${role}` });
    }

    const newUser = new User({ name, email, password, role, address, subjects: role === 'Teacher' ? subjects || [] : [], theme });
    await newUser.save(); // Password hashed via pre-save hook

    const token = jwt.sign(
      { _id: newUser._id, role: newUser.role, subjects: newUser.subjects, theme: newUser.theme },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '2d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, address: newUser.address, subjects: newUser.subjects, theme: newUser.theme },
    });
  } catch (error) {
    console.error('Signup Error:', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', details: errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email and role combination already registered' });
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// controllers/authController.js
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body; // Add role as optional
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find all users with the given email
    const users = await User.find({ email }).select('+password');
    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Iterate through users to find a match
    let matchedUser = null;
    for (const user of users) {
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        // If role is provided, match it; otherwise, accept any match
        if (!role || user.role === role) {
          matchedUser = user;
          break;
        }
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { _id: matchedUser._id, role: matchedUser.role, subjects: matchedUser.role === 'Teacher' ? matchedUser.subjects : [], theme: matchedUser.theme },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '2d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { _id: matchedUser._id, name: matchedUser.name, email: matchedUser.email, role: matchedUser.role, subjects: matchedUser.role === 'Teacher' ? matchedUser.subjects : [], theme: matchedUser.theme },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

//** fetch profile for all role
exports.fetchProfile = async (req, res) => {
  try {
    const { _id } = req.user; // Extracted by authMiddleware from JWT
    const user = await User.findById(_id).select('name email role address subjects theme');
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//** update profile for all role
exports.updateProfile = async (req, res) => {
  try {
    const { _id } = req.user; // From JWT via authMiddleware
    const { name, email, password, address, subjects, theme } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find the user
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update fields
    user.name = name;
    user.email = email;
    if (password && password.trim() !== '') {
      user.password = password; // Hashed by pre-save hook
    }
    if (address) {
      user.address = address;
    }
    if (user.role === 'Teacher' && subjects) {
      user.subjects = subjects; // Update subjects for teachers
    }
    if (theme) {
      user.theme = theme;
    }

    await user.save();

    // Generate new token with updated data
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role, subjects: user.role === 'Teacher' ? user.subjects : [], theme: user.theme },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '2d' }
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, address: user.address, subjects: user.role === 'Teacher' ? user.subjects : [], theme: user.theme },
      token,
    });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation failed', details: errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// exports.fetchAdminProfile = async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const user = await User.findById(_id).select('name email role');
//     if (!user || user.role !== 'Admin') {
//       return res.status(404).json({ message: 'Admin profile not found' });
//     }
//     res.status(200).json({ user });
//   } catch (error) {
//     console.error('Error fetching admin profile:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// exports.updateAdminProfile = async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const { name, email, password } = req.body;

//     // Validate input
//     if (!name || !email) {
//       return res.status(400).json({ message: 'Name and email are required' });
//     }

//     // Check if email is valid
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: 'Invalid email format' });
//     }

//     // Find the user
//     const user = await User.findById(_id);
//     if (!user || user.role !== 'Admin') {
//       return res.status(404).json({ message: 'Admin profile not found' });
//     }

//     // Update fields
//     user.name = name;
//     user.email = email;
//     if (password && password.trim() !== '') {
//       user.password = password; // Will be hashed by pre-save hook
//     }

//     await user.save();

//     // Generate new token with updated data
//     const token = jwt.sign(
//       { _id: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET || 'your-secret-key',
//       { expiresIn: '1d' }
//     );

//     res.status(200).json({
//       message: 'Profile updated successfully',
//       user: { _id: user._id, name: user.name, email: user.email, role: user.role },
//       token,
//     });
//   } catch (error) {
//     console.error('Error updating admin profile:', error.message);
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map((err) => err.message);
//       return res.status(400).json({ message: 'Password must be at least 6 characters', details: errors });
//     }
//     if (error.code === 11000) {
//       return res.status(400).json({ message: 'Email already in use' });
//     }
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// exports.fetchTeacherProfile = async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const user = await User.findById(_id).select('name email role address');
//     if (!user || user.role !== 'Teacher') {
//       return res.status(404).json({ message: 'Teacher profile not found' });
//     }
//     res.status(200).json({ user });
//   } catch (error) {
//     console.error('Error fetching teacher profile:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// exports.updateTeacherProfile = async (req, res) => {
//   try {
//     const { _id } = req.user;
//     const { name, email, password, address } = req.body;

//     // Validate input
//     if (!name || !email) {
//       return res.status(400).json({ message: 'Name and email are required' });
//     }

//     // Check if email is valid
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ message: 'Invalid email format' });
//     }

//     // Find the user
//     const user = await User.findById(_id);
//     if (!user || user.role !== 'Teacher') {
//       return res.status(404).json({ message: 'Teacher profile not found' });
//     }

//     // Update fields
//     user.name = name;
//     user.email = email;
//     if (password && password.trim() !== '') {
//       user.password = password; // Will be hashed by pre-save hook
//     }
//     if (address) {
//       user.address = address;
//     }

//     await user.save();

//     // Generate new token with updated data
//     const token = jwt.sign(
//       { _id: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET || 'your-secret-key',
//       { expiresIn: '1d' }
//     );

//     res.status(200).json({
//       message: 'Profile updated successfully',
//       user: { _id: user._id, name: user.name, email: user.email, role: user.role, address: user.address },
//       token,
//     });
//   } catch (error) {
//     console.error('Error updating teacher profile:', error.message);
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map((err) => err.message);
//       return res.status(400).json({ message: 'Password must be at least 6 characters', details: errors });
//     }
//     if (error.code === 11000) {
//       return res.status(400).json({ message: 'Email already in use' });
//     }
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

exports.updateUser = async (req, res) => {
  try {
    // Extract admin's ID and role from req.user (set by authMiddleware)
    const { _id: adminId, role } = req.user;
    
    // Restrict access to admins only
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admin can update users' });
    }

    // Get userId from URL parameters
    const { userId } = req.params;
    
    // Get update data from request body
    const { name, email, password, address, subjects, theme } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password; // Note: Ensure password hashing if needed
    if (address) updateData.address = address;
    if (subjects !== undefined) updateData.subjects = subjects;
    if (theme) updateData.theme = theme;

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true } // Return updated doc, run schema validators
    );

    // Check if user exists
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Success response
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', details: errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};