// E:/Student Management System(SMS)/Backend/controllers/courseController.js
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');

exports.getCourses = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let courses;
    if (role === 'Teacher') {
      const teacherRecord = await Teacher.findOne({ user: userId });
      if (!teacherRecord) return res.status(403).json({ message: 'No teacher record found' });
      courses = await Course.find({ teacher: teacherRecord._id }).populate({
        path: 'teacher',
        select: 'user subject',
        populate: { path: 'user', select: 'name email' },
      });
    } else {
      courses = await Course.find().populate({
        path: 'teacher',
        select: 'user subject',
        populate: { path: 'user', select: 'name email' },
      });
    }
    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error getting courses:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.addCourse = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { title, description, teacher } = req.body;

    if (!title || !teacher) {
      return res.status(400).json({ message: 'Title and teacher are required' });
    }

    if (role === 'Student') {
      return res.status(403).json({ message: 'Students cannot add courses' });
    }

    let teacherId = teacher;
    if (role === 'Teacher') {
      const teacherRecord = await Teacher.findOne({ user: userId });
      if (!teacherRecord) return res.status(403).json({ message: 'No teacher record found' });
      teacherId = teacherRecord._id; // Teacher can only assign themselves
    }
    
    const existingCourse = await Course.findOne({ teacher: teacherId });
  if (existingCourse) {
    return res.status(400).json({ message: 'This teacher is already assigned to a course' });
  }
  
    const teacherDoc = await Teacher.findById(teacherId);
    if (!teacherDoc) {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    const course = new Course({ title, description: description || '', teacher: teacherId });
    await course.save();

    const populatedCourse = await Course.findById(course._id).populate({
      path: 'teacher',
      select: 'user subject',
      populate: { path: 'user', select: 'name email' },
    });

    res.status(201).json({ course: populatedCourse });
  } catch (error) {
    console.error('Error adding course:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { id } = req.params;
    const { title, description, teacher } = req.body;

    if (role === 'Student') {
      return res.status(403).json({ message: 'Forbidden: Students cannot update courses' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (role === 'Teacher') {
      const teacherRecord = await Teacher.findOne({ user: userId });
      if (!teacherRecord || course.teacher.toString() !== teacherRecord._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own courses' });
      }
    }

    if (teacher && role === 'Admin') {
      const teacherDoc = await Teacher.findById(teacher);
      if (!teacherDoc) return res.status(400).json({ message: 'Invalid teacher ID' });
      course.teacher = teacher;
    }

    course.title = title || course.title;
    course.description = description || course.description;
    await course.save();

    const populatedCourse = await Course.findById(id).populate({
      path: 'teacher',
      select: 'user subject',
      populate: { path: 'user', select: 'name email' },
    });

    res.status(200).json({ course: populatedCourse });
  } catch (error) {
    console.error('Error updating course:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { id } = req.params;

    if (role === 'Student') {
      return res.status(403).json({ message: 'Students cannot delete courses' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (role === 'Teacher') {
      const teacherRecord = await Teacher.findOne({ user: userId });
      if (!teacherRecord || course.teacher.toString() !== teacherRecord._id.toString()) {
        return res.status(403).json({ message: 'You can only delete your own courses' });
      }
    }

    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error.message, error.stack);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};