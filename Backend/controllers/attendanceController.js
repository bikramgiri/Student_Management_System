// controllers/attendanceController.js
const Attendance = require('../models/Attendance');

exports.submitAttendance = async (req, res) => {
  try {
    const { role, _id: teacherId } = req.user;

    // Role check
    if (role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden: Only Teachers can submit attendance' });
    }

    // Destructure and validate request body
    const { date, records } = req.body;
    if (!date || !records || typeof records !== 'object') {
      return res.status(400).json({ message: 'Date and records are required and records must be an object' });
    }

    // Validate date format
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Check if records is empty
    if (Object.keys(records).length === 0) {
      return res.status(400).json({ message: 'Attendance records cannot be empty' });
    }

    // Create and save attendance record
    const attendance = new Attendance({
      date: parsedDate,
      teacher: teacherId,
      records,
    });
    await attendance.save();

    // Return success response with saved data
    res.status(201).json({
      message: 'Attendance submitted successfully',
      attendance: {
        _id: attendance._id,
        date: attendance.date,
        teacher: attendance.teacher,
        records: attendance.records,
      },
    });
  } catch (error) {
    console.error('Error submitting attendance:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};