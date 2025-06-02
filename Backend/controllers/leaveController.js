// controllers/leaveController.js
const Leave = require('../models/Leave');
const User = require('../models/User');

exports.getStudentLeaves = async (req, res) => {
  try {
    const { role, _id: studentId } = req.user;
    if (role !== 'Student') return res.status(403).json({ message: 'Forbidden' });

    const leaves = await Leave.find({ student: studentId })
      .populate('student', 'name email')
      .populate('admin', 'name email');
    res.status(200).json({ leaves });
  } catch (error) {
    console.error('Error fetching student leaves:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit leave for students (to admin)
exports.submitLeave = async (req, res) => {
  try {
    const { role, _id: studentId } = req.user;
    if (role !== 'Student') return res.status(403).json({ message: 'Forbidden: Only students can submit leaves' });

    const { date, reason, admin } = req.body;
    if (!date || !reason || !admin) return res.status(400).json({ message: 'Date, reason, and admin are required' });

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return res.status(400).json({ message: 'Invalid date format' });
    if (parsedDate < new Date().setHours(0, 0, 0, 0)) return res.status(400).json({ message: 'Date cannot be in the past' });

    const adminUser = await User.findById(admin);
    if (!adminUser || adminUser.role !== 'Admin') return res.status(400).json({ message: 'Invalid admin ID or user is not an admin' });

    const leave = new Leave({ student: studentId, date: parsedDate, reason, admin, status: 'Pending' });
    await leave.save();
    await leave.populate('student', 'name email').populate('admin', 'name email');

    res.status(201).json({ message: 'Leave submitted successfully', leave });
  } catch (error) {
    console.error('Error submitting leave:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') return res.status(403).json({ message: 'Forbidden: Only admins can view all leaves' });

    const leaves = await Leave.find()
      .populate('student', 'name email')
      .populate('admin', 'name email');
    res.status(200).json({ leaves });
  } catch (error) {
    console.error('Error fetching all leaves:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') return res.status(403).json({ message: 'Forbidden: Only admins can update leave status' });

    const { status } = req.body;
    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "Pending", "Approved", or "Rejected"' });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('student', 'name email')
      .populate('admin', 'name email');

    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    res.status(200).json({ message: 'Leave status updated successfully', leave });
  } catch (error) {
    console.error('Error updating leave status:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid leave ID' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit leave for teachers
exports.submitTeacherLeave = async (req, res) => {
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