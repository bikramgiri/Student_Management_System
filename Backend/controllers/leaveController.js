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
exports.submitStudentLeave = async (req, res) => {
  try {
    console.log('submitLeave: Starting, req.user:', req.user);
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }
    const { role, _id: studentId } = req.user;
    console.log('User role:', role, 'studentId:', studentId);
    if (role !== 'Student') return res.status(403).json({ message: 'Forbidden: Only students can submit leaves' });

    const { date, reason, admin } = req.body;
    console.log('Request body:', { date, reason, admin });
    if (!date || !reason || !admin) return res.status(400).json({ message: 'Date, reason, and admin are required' });

const parsedDate = new Date(date);
    console.log('Parsed date:', parsedDate);
    if (isNaN(parsedDate.getTime())) return res.status(400).json({ message: 'Invalid date format' });
    // Allow current day or future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) return res.status(400).json({ message: 'Date cannot be in the past' });

    const adminUser = await User.findById(admin);
    console.log('Admin user found:', adminUser);
    if (!adminUser || adminUser.role !== 'Admin') return res.status(400).json({ message: 'Invalid admin ID or user is not an admin' });

    const leave = new Leave({ student: studentId, date: parsedDate, reason, admin, status: 'Pending' });
    console.log('Leave object created:', leave);
    await leave.save();
    console.log('Leave saved');

    res.status(201).json({ message: 'Leave submitted successfully', leave });
  } catch (error) {
console.error('Error submitting leave:', error.message);
    if (error.name === 'ReferenceError') {
      return res.status(500).json({ message: 'Internal server error: Missing student ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit leave for teachers
exports.submitTeacherLeave = async (req, res) => {
  try {
    console.log('submitTeacherLeave: Starting, req.user:', req.user, 'req.body:', req.body);
    const { role, _id: teacherId } = req.user;

    if (role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden: Only Teachers can submit leave applications' });
    }

    const { date, reason } = req.body;
    if (!date || !reason || typeof reason !== 'string' || reason.trim() === '') {
      return res.status(400).json({ message: 'Date and a non-empty reason are required' });
    }

    const parsedDate = new Date(date);
    const today = new Date('2025-06-19T13:10:00+05:45');
    today.setHours(0, 0, 0, 0);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    if (parsedDate < today) {
      return res.status(400).json({ message: 'Leave date cannot be in the past' });
    }

    const trimmedReason = reason.trim();
    if (trimmedReason.length > 500) {
      return res.status(400).json({ message: 'Reason cannot exceed 500 characters' });
    }

    const existingLeave = await Leave.findOne({ teacher: teacherId, date: parsedDate });
    if (existingLeave) {
      return res.status(400).json({ message: 'Leave already requested for this date' });
    }

    const leave = new Leave({
      teacher: teacherId,
      date: parsedDate,
      reason: trimmedReason,
      status: 'Pending',
    });
    await leave.save();

    await leave.populate('teacher', 'name email');

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave: {
        _id: leave._id,
        teacher: leave.teacher,
        date: leave.date,
        reason: leave.reason,
        status: leave.status,
        createdAt: leave.createdAt,
      },
    });
  } catch (error) {
    console.error('Error submitting leave:', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    let query = {};

    if (role === 'Teacher') {
      query.teacher = userId; // Filter by the teacher's ID
    } else if (role === 'Student') {
      query.student = userId; // Filter by the student's ID
    } // Admins see all leaves

    const leaves = await Leave.find(query)
      .populate('student', 'name email')
      .populate('teacher', 'name email')
      .populate('admin', 'name email');
    res.status(200).json({ leaves });
  } catch (error) {
    console.error('Error fetching all leaves:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// exports.getAllLeaves = async (req, res) => {
//   try {
//     const leaves = await Leave.find()
//       .populate('student', 'name email')
//       .populate('teacher', 'name email')
//       .populate('admin', 'name email');
//     res.status(200).json({ leaves });
//   } catch (error) {
//     console.error('Error fetching all leaves:', error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

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
      .populate('teacher', 'name email')
      .populate('admin', 'name email');

    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    res.status(200).json({ message: 'Leave status updated successfully', leave });
  } catch (error) {
    console.error('Error updating leave status:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid leave ID' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTeacherLeave = async (req, res) => {
  try {
    const { role, _id: teacherId } = req.user;
    if (role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden: Only Teachers can update leave reason' });
    }

    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return res.status(400).json({ message: 'A non-empty reason is required' });
    }

    const trimmedReason = reason.trim();
    if (trimmedReason.length > 500) {
      return res.status(400).json({ message: 'Reason cannot exceed 500 characters' });
    }

    const leave = await Leave.findOne({ _id: id, teacher: teacherId });
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found or unauthorized' });
    }

    leave.reason = trimmedReason;
    await leave.save();

    await leave.populate('teacher', 'name email');

    res.status(200).json({
      message: 'Leave reason updated successfully',
      leave: {
        _id: leave._id,
        teacher: leave.teacher,
        date: leave.date,
        reason: leave.reason,
        status: leave.status,
        createdAt: leave.createdAt,
      },
    });
  } catch (error) {
    console.error('Error updating leave:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid leave ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStudentLeave = async (req, res) => {
  try {
    const { role, _id: studentId } = req.user;
    if (role !== 'Student') {
      return res.status(403).json({ message: 'Forbidden: Only students can update their leave reason' });
    }

    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return res.status(400).json({ message: 'A non-empty reason is required' });
    }

    const trimmedReason = reason.trim();
    if (trimmedReason.length > 500) {
      return res.status(400).json({ message: 'Reason cannot exceed 500 characters' });
    }

    const leave = await Leave.findOne({ _id: id, student: studentId });
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found or unauthorized' });
    }

    leave.reason = trimmedReason;
    await leave.save();

    // Correct population: Use a single populate call with multiple fields
    await leave.populate('student','name email')
      // await leave.populate('teacher', 'name email');


    res.status(200).json({
      message: 'Leave reason updated successfully',
      leave: {
        _id: leave._id,
        student: leave.student,
        date: leave.date,
        reason: leave.reason,
        status: leave.status,
        createdAt: leave.createdAt,
      },
    });
  } catch (error) {
    console.error('Error updating leave:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid leave ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const { role } = req.user;
    // if (role !== 'Admin') return res.status(403).json({ message: 'Forbidden: Only admins can delete leaves' });

    const leave = await Leave.findByIdAndDelete(req.params.id)
      .populate('student', 'name email')
      .populate('teacher', 'name email')
      .populate('admin', 'name email');

    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    res.status(200).json({ message: 'Leave deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave:', error.message);
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid leave ID' });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};