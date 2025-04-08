// controllers/leaveController.js
const Leave = require('../models/Leave');

exports.submitLeave = async (req, res) => {
  try {
    const { role, _id: teacherId } = req.user;

    // Role check
    if (role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden: Only Teachers can submit leave applications' });
    }

    // Destructure and validate request body
    const { date, reason } = req.body;
    if (!date || !reason || typeof reason !== 'string' || reason.trim() === '') {
      return res.status(400).json({ message: 'Date and a non-empty reason are required' });
    }

    // Validate date format and ensure it's not in the past
    const parsedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    if (parsedDate < today) {
      return res.status(400).json({ message: 'Leave date cannot be in the past' });
    }

    // Optional: Limit reason length
    const trimmedReason = reason.trim();
    if (trimmedReason.length > 500) {
      return res.status(400).json({ message: 'Reason cannot exceed 500 characters' });
    }

    // Check for duplicate leave request
    const existingLeave = await Leave.findOne({ teacher: teacherId, date: parsedDate });
    if (existingLeave) {
      return res.status(400).json({ message: 'Leave already requested for this date' });
    }

    // Create and save leave record with status
    const leave = new Leave({
      teacher: teacherId,
      date: parsedDate,
      reason: trimmedReason,
      status: 'Pending',
    });
    await leave.save();

    // Populate teacher data
    await leave.populate('teacher', 'name email');

    // Return success response with populated data
    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave: {
        _id: leave._id,
        teacher: leave.teacher, // Now includes { _id, name, email }
        date: leave.date,
        reason: leave.reason,
        status: leave.status,
        createdAt: leave.createdAt,
      },
    });
  } catch (error) {
    console.error('Error submitting leave:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};