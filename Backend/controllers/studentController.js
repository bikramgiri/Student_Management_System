// controllers/studentController.js
const Student = require('../models/Student');
const User = require('../models/User');

exports.getStudents = async (req, res) => {
  try {
    const { role } = req.user;
    if (role === 'Student') {
      return res.status(403).json({ message: 'Forbidden: Students cannot view student records' });
    }

    if (role === 'Teacher') {
      // Teachers get flat User data for attendance/results
      const students = await User.find({ role: 'Student' }).select('_id name email');
      return res.status(200).json({ students });
    }

    // Admins get full Student records
    const students = await Student.find().populate('user', 'name email');
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
    if (!user || !enrollmentNumber) {
      return res.status(400).json({ message: 'User and enrollment number are required' });
    }

     // Check if the user already exists as a student
    const existingStudent = await Student.findOne({ user });
    if (existingStudent) {
      return res.status(400).json({ message: 'This student is already enrolled in a class' });
    }

    // Validate user exists and has role 'Student'
    const userDoc = await User.findById(user);
    if (!userDoc || userDoc.role !== 'Student') {
      return res.status(400).json({ message: 'Invalid user or user is not a student' });
    }

    const student = new Student({ user, enrollmentNumber, class: className || '', section: section || '' });
    await student.save();
    await student.populate('user', 'name email');
    res.status(201).json({ message: 'Student added successfully', student });
  } catch (error) {
    console.error('Error adding student:', error.message);
    // if (error.code === 11000) { // Duplicate key error
    //   return res.status(400).json({ message: 'This student is already enrolled' });
    // }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation failed', details: errors });
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
    const { user, enrollmentNumber, class: className, section } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate new user if provided
    if (user && user !== student.user.toString()) {
      const userDoc = await User.findById(user);
      if (!userDoc || userDoc.role !== 'Student') {
        return res.status(400).json({ message: 'Invalid user or user is not a student' });
      }
    }

    // Check for duplicate enrollmentNumber if changed
    if (enrollmentNumber && enrollmentNumber !== student.enrollmentNumber) {
      const existingStudent = await Student.findOne({ enrollmentNumber });
      if (existingStudent && existingStudent._id.toString() !== id) {
        return res.status(400).json({ message: 'Enrollment number already exists' });
      }
    }

    student.user = user || student.user;
    student.enrollmentNumber = enrollmentNumber || student.enrollmentNumber;
    student.class = className || student.class;
    student.section = section || student.section;
    await student.save();
    await student.populate('user', 'name email role');
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
    // if (error.name === 'CastError') {
    //   return res.status(400).json({ message: 'Invalid student ID' });
    // }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getPotentialStudents = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admin can fetch potential students' });
    }

    const potentialStudents = await User.find({ role: 'Student' }).select('_id name email');
    res.status(200).json({ potentialStudents });
  } catch (error) {
    console.error('Error fetching potential students:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};