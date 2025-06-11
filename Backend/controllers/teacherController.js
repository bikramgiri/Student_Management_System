const Teacher = require('../models/Teacher');
const User = require('../models/User');

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('user', 'name email');
    res.status(200).json({ teachers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getPotentialTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select('user');
    const assignedUserIds = teachers.map(t => t.user.toString());
    const potentialTeachers = await User.find({
      _id: { $nin: assignedUserIds },
      role: 'Teacher',
    }).select('name email _id');
    res.status(200).json({ potentialTeachers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAvailableTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select('user');
    const assignedUserIds = teachers.map(t => t.user.toString());
    const availableTeachers = await User.find({
      _id: { $nin: assignedUserIds },
      role: { $ne: 'Admin' }, // Exclude admins
    }).select('name email _id');
    res.status(200).json({ teachers: availableTeachers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addTeacher = async (req, res) => {
  try {
    const { user, subject, qualification, experience } = req.body;
    if (!user || !subject || !qualification) {
      return res.status(400).json({ message: 'User, subject, and qualification are required' });
    }
    if (experience && (isNaN(Number(experience)) || Number(experience) < 0)) {
      return res.status(400).json({ message: 'Experience must be a non-negative number' });
    }

    const teacher = new Teacher({
      user,
      subject,
      qualification,
      experience: Number(experience) || 0,
    });
    await teacher.save();
    const populatedTeacher = await Teacher.findById(teacher._id).populate('user', 'name email');
    res.status(201).json({ message: 'Teacher added successfully', teacher: populatedTeacher });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name, email, password, subject, qualification, experience } = req.body;
    if (!subject || !qualification) {
      return res.status(400).json({ message: 'Subject and qualification are required' });
    }
    if (experience && (isNaN(Number(experience)) || Number(experience) < 0)) {
      return res.status(400).json({ message: 'Experience must be a non-negative number' });
    }

    // Update User data
    if (userId && (name || email || password)) {
      const updateUserData = {};
      if (name) updateUserData.name = name;
      if (email) updateUserData.email = email;
      if (password) updateUserData.password = password; // Assumes pre-save hook hashes password
      await User.findByIdAndUpdate(userId, updateUserData, { new: true, runValidators: true });
    }

    // Update Teacher data
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      id,
      { subject, qualification, experience: Number(experience) || 0 },
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    if (!updatedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.status(200).json({ message: 'Teacher updated successfully', teacher: updatedTeacher });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTeacher = await Teacher.findByIdAndDelete(id);
    if (!deletedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};