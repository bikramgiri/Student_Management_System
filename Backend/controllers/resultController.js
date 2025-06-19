const Result = require('../models/Result');

exports.getAllResults = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') return res.status(403).json({ message: 'Forbidden: Only Admins can view all results' });
    const results = await Result.find().populate('student', 'name email').populate('teacher', 'name email');
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitResult = async (req, res) => {
  try {
    const { role, _id: teacherId } = req.user;

    if (role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden: Only Teachers can submit results' });
    }

    const { studentId, subject, marks, _id } = req.body;
    if (!studentId || !subject || marks === undefined) {
      return res.status(400).json({ message: 'Student ID, subject, and marks are required' });
    }

    const parsedMarks = Number(marks);
    if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
      return res.status(400).json({ message: 'Marks must be a number between 0 and 100' });
    }

    if (_id) {
      const result = await Result.findByIdAndUpdate(
        _id,
        { student: studentId, subject, marks: parsedMarks, teacher: teacherId },
        { new: true, runValidators: true }
      ).populate([
        { path: 'student', select: 'name email' },
        { path: 'teacher', select: 'name email' },
      ]);
      if (!result) {
        return res.status(404).json({ message: 'Result not found' });
      }
      return res.status(200).json({
        message: 'Result updated successfully',
        result: {
          _id: result._id,
          student: result.student,
          subject: result.subject,
          marks: result.marks,
          teacher: result.teacher,
        },
      });
    } else {
      const result = new Result({
        student: studentId,
        subject,
        marks: parsedMarks,
        teacher: teacherId,
      });
      await result.save();
      await result.populate([
        { path: 'student', select: 'name email' },
        { path: 'teacher', select: 'name email' },
      ]);
      res.status(201).json({
        message: 'Result submitted successfully',
        result: {
          _id: result._id,
          student: result.student,
          subject: result.subject,
          marks: result.marks,
          teacher: result.teacher,
        },
      });
    }
  } catch (error) {
    console.error('Error submitting result:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid student or teacher ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTeacherResults = async (req, res) => {
  try {
    const { role, _id: teacherId } = req.user;
    if (role !== 'Teacher') return res.status(403).json({ message: 'Forbidden' });
    const results = await Result.find({ teacher: teacherId }).populate('student', 'name email');
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStudentResults = async (req, res) => {
  try {
    const { role, _id: studentId } = req.user;
    if (role !== 'Student') return res.status(403).json({ message: 'Forbidden' });
    const results = await Result.find({ student: studentId }).populate('teacher', 'name email');
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getResultSummary = async (req, res) => {
  try {
    const results = await Result.aggregate([
      {
        $group: {
          _id: '$subject',
          average: { $avg: '$marks' },
        },
      },
      {
        $project: {
          subject: '$_id',
          average: 1,
          _id: 0,
        },
      },
    ]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching result summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const { role, _id: teacherId } = req.user;
    if (role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden: Only Teachers can delete results' });
    }
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    res.status(200).json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};