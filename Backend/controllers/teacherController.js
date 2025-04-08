const Teacher = require('../models/Teacher');
const User = require('../models/User');

exports.getTeachers = async (req, res) => {
  try {
    const { role } = req.user;
    if (role === 'Student') {
      return res.status(403).json({ message: 'Forbidden: Students cannot view teacher records' });
    }
    const teachers = await Teacher.find().populate('user', 'name email');
    res.status(200).json({ teachers }); // Align with teacherSlice.js
  } catch (error) {
    console.error('Error fetching teachers:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.addTeacher = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admin can add teachers' });
    }
    const { user, subject, qualification, experience } = req.body;
    if (!user || !subject || !qualification) {
      return res.status(400).json({ message: 'User, subject, and qualification are required' });
    }

    const userDoc = await User.findById(user);
    if (!userDoc || userDoc.role !== 'Teacher') {
      return res.status(400).json({ message: 'Invalid user or user is not a teacher' });
    }

    const existingTeacher = await Teacher.findOne({ user });
    if (existingTeacher) {
      return res.status(400).json({ message: 'This user is already assigned as a teacher' });
    }

    const teacherData = { user, subject, qualification };
    if (experience !== undefined) {
      if (typeof experience !== 'number' || isNaN(experience) || experience < 0) {
        return res.status(400).json({ message: 'Experience must be a non-negative number' });
      }
      teacherData.experience = experience;
    }

    const teacher = new Teacher({ user, subject, qualification: qualification || '', experience: experience || 0});
    await teacher.save();
    await teacher.populate('user', 'name email');
    res.status(201).json({message: 'Teacher added successfully', teacher }); // Align with teacherSlice.js
  } catch (error) {
    console.error('Error adding teacher:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admin can update teachers' });
    }
    const { id } = req.params;
    const { user, subject, qualification, experience } = req.body;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (user && user !== teacher.user.toString()) {
      const userDoc = await User.findById(user);
      if (!userDoc || userDoc.role !== 'Teacher') {
        return res.status(400).json({ message: 'Selected user must have Teacher role' });
      }
      const existingTeacher = await Teacher.findOne({ user });
      if (existingTeacher && existingTeacher._id.toString() !== id) {
        return res.status(400).json({ message: 'This user is already assigned as a teacher' });
      }
      teacher.user = user;
    }

    teacher.subject = subject || teacher.subject;
    teacher.qualification = qualification || teacher.qualification;
    teacher.experience = experience || teacher.experience;
    await teacher.save();
    await teacher.populate('user', 'name email role');
    res.status(200).json({ teacher }); // Align with potential update action
  } catch (error) {
    console.error('Error updating teacher:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admin can delete teachers' });
    }
    const { id } = req.params;
    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getPotentialTeachers = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admin can fetch potential teachers' });
    }
    const potentialTeachers = await User.find({ role: 'Teacher' }).select('_id name email');
    res.status(200).json({ potentialTeachers }); // Align with authSlice.js
  } catch (error) {
    console.error('Error fetching potential teachers:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};