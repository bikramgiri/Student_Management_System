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

    // Transform records object into an array of { student, status }
    const recordsArray = Object.entries(records).map(([studentId, status]) => ({
      student: studentId,
      status,
    }));

    // Create and save attendance record
    const attendance = new Attendance({
      date: parsedDate,
      teacher: teacherId,
      records: recordsArray,
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

exports.getStudentAttendance = async (req, res) => {
  try {
    const { role, _id: studentId } = req.user;
    if (role !== 'Student') return res.status(403).json({ message: 'Forbidden' });

    const attendance = await Attendance.find({ 'records.student': studentId })
      .populate('teacher', 'name email')
      .populate('records.student', 'name email');
    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { date } = req.query; // Optional: filter by date in "MM/DD/YYYY" format from toLocaleDateString()

    const query = {};
    if (date) {
      // Parse the date string from "MM/DD/YYYY" to a Date object
      const [month, day, year] = date.split('/');
      if (!month || !day || !year || isNaN(new Date(year, month - 1, day).getTime())) {
        return res.status(400).json({ message: 'Invalid date format. Use MM/DD/YYYY' });
      }

      // Create a date range for the entire day
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0); // Start of the day
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999); // End of the day

      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.aggregate([
      { $match: query },
      { $unwind: '$records' },
      { $group: { _id: '$records.status', count: { $sum: 1 } } },
    ]);

    const summary = { present: 0, absent: 0, late: 0 };
    attendance.forEach((item) => {
      if (item._id === 'Present') summary.present = item.count;
      else if (item._id === 'Absent') summary.absent = item.count;
      else if (item._id === 'Late') summary.late = item.count;
    });

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
