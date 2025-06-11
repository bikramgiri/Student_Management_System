const Result = require('../models/Result');

exports.submitResult = async (req, res) => {
  try {
    const { role, _id: teacherId } = req.user;

    if (role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden: Only Teachers can submit results' });
    }

    const { studentId, subject, marks } = req.body;
    if (!studentId || !subject || marks === undefined) {
      return res.status(400).json({ message: 'Student ID, subject, and marks are required' });
    }

    const parsedMarks = Number(marks);
    if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
      return res.status(400).json({ message: 'Marks must be a number between 0 and 100' });
    }

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
          _id: '$subject', // Changed from '$course' to '$subject'
          average: { $avg: '$marks' },
        },
      },
      {
        $project: {
          subject: '$_id',
          average: 1,
          _id: 0, // Exclude _id from the response
        },
      },
    ]);

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching result summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};