const Student = require('../models/Student');
const User = require('../models/User');

exports.getStudents = async (req, res) => {
  try {
    const { role } = req.user;
    if (role === 'Student') {
      return res.status(403).json({ message: 'Forbidden: Students cannot view student records' });
    }

    if (role === 'Teacher') {
      const students = await User.find({ role: 'Student' }).select('_id name email address');
      return res.status(200).json({ students });
    }

    const students = await Student.find().populate('user', 'name email address');
    res.status(200).json({ students });
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admin can add students' });
    }

    const { user, enrollmentNumber, class: className, section } = req.body;
    console.log('Received add student request with body:', JSON.stringify(req.body, null, 2)); // Debug log
    if (!user || !enrollmentNumber) {
      console.log('Validation failed - user:', user, 'enrollmentNumber:', enrollmentNumber); // Debug log
      return res.status(400).json({ message: 'User ID and enrollment number are required' });
    }

    // Optional: Validate that the user exists and has the 'Student' role
    const userDoc = await User.findById(user);
    if (!userDoc || userDoc.role !== 'Student') {
      return res.status(400).json({ message: 'Invalid user ID or user is not a student' });
    }

    const student = new Student({
      user,
      enrollmentNumber,
      class: className || '',
      section: section || '',
      address: userDoc.address || '', // Use address from user if available
    });
    await student.save();
    await student.populate('user', 'name email address');
    res.status(201).json({ message: 'Student added successfully', student });
  } catch (error) {
    console.error('Error adding student:', error.message, 'Stack:', error.stack);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation failed', details: errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Enrollment number already exists' });
    }
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admin can update students' });
    }

    const { id } = req.params;
    const { userId, name, email, password, address, enrollmentNumber, class: className, section } = req.body;

    const student = await Student.findById(id).populate('user', 'name email address');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (userId && (name || email || password || address)) {
      const updateUserData = {};
      if (name) updateUserData.name = name;
      if (email) updateUserData.email = email;
      if (password) updateUserData.password = password;
      if (address) updateUserData.address = address;
      await User.findByIdAndUpdate(userId, updateUserData, { new: true, runValidators: true });
    }

    student.enrollmentNumber = enrollmentNumber || student.enrollmentNumber;
    student.class = className || student.class;
    student.section = section || student.section;
    await student.save();
    await student.populate('user', 'name email address');
    res.status(200).json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Error updating student:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student or user ID' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admin can delete students' });
    }

    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getPotentialStudents = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admin can fetch potential students' });
    }

    const potentialStudents = await User.find({ role: 'Student' }).select('_id name email address');
    res.status(200).json({ potentialStudents });
  } catch (error) {
    console.error('Error fetching potential students:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};