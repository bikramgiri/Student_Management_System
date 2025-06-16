// E:/Student Management System(SMS)/Backend/controllers/courseController.js
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');

exports.getSubjects = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let subjects;
    if (role === 'Teacher') {
      const teacherRecord = await Teacher.findOne({ user: userId });
      if (!teacherRecord) return res.status(403).json({ message: 'No teacher record found' });
      subjects = await Subject.find({ teacher: teacherRecord._id }).populate({
        path: 'teacher',
        select: 'user',
        populate: { path: 'user', select: 'name email' },
      });
    } else {
      subjects = await Subject.find().populate({
        path: 'teacher',
        select: 'user',
        populate: { path: 'user', select: 'name email' },
      });
    }
    res.status(200).json({ subjects });
  } catch (error) {
    console.error('Error getting subjects:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.addSubject = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { title, teacher } = req.body;

    if (!title || !teacher) {
      return res.status(400).json({ message: 'Title and teacher are required' });
    }

    if (role === 'Student') {
      return res.status(403).json({ message: 'Students cannot add subjects' });
    }

    let teacherId = teacher;
    if (role === 'Teacher') {
      const teacherRecord = await Teacher.findOne({ user: userId });
      if (!teacherRecord) return res.status(403).json({ message: 'No teacher record found' });
      teacherId = teacherRecord._id; // Teacher can only assign themselves
    } else if (role === 'Admin') {
      const teacherDoc = await Teacher.findById(teacherId);
      if (!teacherDoc) return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    const subject = new Subject({ title, teacher: teacherId });
    await subject.save();

    const populatedSubject = await Subject.findById(subject._id).populate({
      path: 'teacher',
      select: 'user',
      populate: { path: 'user', select: 'name email' },
    });

    res.status(201).json({ subject: populatedSubject });
  } catch (error) {
    console.error('Error adding subject:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { id } = req.params;
    const { title, teacher } = req.body;

    if (role === 'Student') {
      return res.status(403).json({ message: 'Forbidden: Students cannot update subjects' });
    }

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (role === 'Teacher') {
      const teacherRecord = await Teacher.findOne({ user: userId });
      if (!teacherRecord || subject.teacher.toString() !== teacherRecord._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own subjects' });
      }
    }

    if (teacher && role === 'Admin') {
      const teacherDoc = await Teacher.findById(teacher);
      if (!teacherDoc) return res.status(400).json({ message: 'Invalid teacher ID' });
      subject.teacher = teacher;
    }

    subject.title = title || subject.title;
    await subject.save();

    const populatedSubject = await Subject.findById(id).populate({
      path: 'teacher',
      select: 'user',
      populate: { path: 'user', select: 'name email' },
    });

    res.status(200).json({ subject: populatedSubject });
  } catch (error) {
    console.error('Error updating subject:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { id } = req.params;

    if (role === 'Student') {
      return res.status(403).json({ message: 'Students cannot delete subjects' });
    }

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (role === 'Teacher') {
      const teacherRecord = await Teacher.findOne({ user: userId });
      if (!teacherRecord || subject.teacher.toString() !== teacherRecord._id.toString()) {
        return res.status(403).json({ message: 'You can only delete your own subjects' });
      }
    }

    await Subject.findByIdAndDelete(id);
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};