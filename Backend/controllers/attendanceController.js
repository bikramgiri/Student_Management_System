// controllers/attendanceController.js
const Attendance = require('../models/Attendance');

exports.submitAttendance = async (req, res) => {
  try {
    const { role, _id: teacherId } = req.user;

    if (role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden: Only Teachers can submit attendance' });
    }

    const { date, records, subject } = req.body;
    if (!date || !records || typeof records !== 'object' || !subject) {
      return res.status(400).json({ message: 'Date, subject and records are required and records must be an object' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (Object.keys(records).length === 0) {
      return res.status(400).json({ message: 'Attendance records cannot be empty' });
    }

    // Check for existing attendance for the same date and any of the students
    const studentIds = Object.keys(records);
    const existingAttendance = await Attendance.findOne({
      date: parsedDate,
      teacher: teacherId,
      subject,
      'records.student': { $in: studentIds },
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: 'Attendance already submitted',
      });
    }

    const recordsArray = Object.entries(records).map(([studentId, status]) => ({
      student: studentId,
      status,
    }));

    const attendance = new Attendance({
      date: parsedDate,
      teacher: teacherId,
      subject,
      records: recordsArray,
    });
    await attendance.save();

    res.status(201).json({
      message: 'Attendance added successfully',
      attendance: {
        _id: attendance._id,
        date: attendance.date,
        teacher: attendance.teacher,
        subject: attendance.subject,
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

    const attendances = await Attendance.find({ 'records.student': studentId })
      .populate('teacher', 'name email')
      .populate('records.student', 'name email');

    const studentAttendance = attendances.map(att => ({
      _id: att._id,
      date: att.date,
      subject: att.subject, // Ensure subject is included
      records: att.records.filter(record => record.student._id.toString() === studentId.toString()),
    }));

    res.status(200).json({ attendance: studentAttendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// exports.getStudentAttendance = async (req, res) => {
//   try {
//     const { role, _id: studentId } = req.user;
//     if (role !== 'Student') return res.status(403).json({ message: 'Forbidden' });

//     const attendance = await Attendance.find({ 'records.student': studentId })
//       .populate('teacher', 'name email')
//       .populate('records.student', 'name email');
//     res.status(200).json({ attendance });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { date } = req.query;
    const { _id: teacherId } = req.user; // Get the teacher's ID from the authenticated user

    const query = { teacher: teacherId }; // Filter by teacher
    if (date) {
      const [month, day, year] = date.split('/');
      if (!month || !day || !year || isNaN(new Date(year, month - 1, day).getTime())) {
        return res.status(400).json({ message: 'Invalid date format. Use MM/DD/YYYY' });
      }
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.aggregate([
      { $match: query },
      { $unwind: '$records' },
      { $group: { _id: '$records.status', count: { $sum: 1 } } },
    ]);

    const summary = { present: 0, absent: 0 };
    attendance.forEach((item) => {
      if (item._id === 'Present') summary.present = item.count;
      else if (item._id === 'Absent') summary.absent = item.count;
    });

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// exports.getAttendanceSummary = async (req, res) => {
//   try {
//     const { date } = req.query;

//     const query = {};
//     if (date) {
//       const [month, day, year] = date.split('/');
//       if (!month || !day || !year || isNaN(new Date(year, month - 1, day).getTime())) {
//         return res.status(400).json({ message: 'Invalid date format. Use MM/DD/YYYY' });
//       }
//       const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
//       const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
//       query.date = { $gte: startDate, $lte: endDate };
//     }

//     const attendance = await Attendance.aggregate([
//       { $match: query },
//       { $unwind: '$records' },
//       { $group: { _id: '$records.status', count: { $sum: 1 } } },
//     ]);

//     const summary = { present: 0, absent: 0, late: 0 };
//     attendance.forEach((item) => {
//       if (item._id === 'Present') summary.present = item.count;
//       else if (item._id === 'Absent') summary.absent = item.count;
//     });

//     res.status(200).json(summary);
//   } catch (error) {
//     console.error('Error fetching attendance summary:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

exports.getAdminAttendanceSummary = async (req, res) => {
  try {
    const { date } = req.query;

    const query = {};
    if (date) {
      const [month, day, year] = date.split('/');
      if (!month || !day || !year || isNaN(new Date(year, month - 1, day).getTime())) {
        return res.status(400).json({ message: 'Invalid date format. Use MM/DD/YYYY' });
      }
      const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.aggregate([
      { $match: query },
      { $unwind: '$records' },
      { $group: { _id: '$records.status', count: { $sum: 1 } } },
    ]);

    const summary = { present: 0, absent: 0 };
    attendance.forEach((item) => {
      if (item._id === 'Present') summary.present = item.count;
      else if (item._id === 'Absent') summary.absent = item.count;
    });

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTeacherAttendance = async (req, res) => {
  try {
    const { _id: teacherId } = req.user;
    const attendance = await Attendance.find({ teacher: teacherId })
      .populate('records.student', '_id name');
    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { attId } = req.params;
    const { studentId, status, subject } = req.body;
    const attendance = await Attendance.findById(attId);
    if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });
    const record = attendance.records.find((rec) => rec.student.toString() === studentId);
    if (!record) return res.status(404).json({ message: 'Student record not found' });
    record.status = status;
    if (subject) attendance.subject = subject; // Update subject if provided
    await attendance.save();
    res.status(200).json({ message: 'Attendance updated', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { attId } = req.params;
    const attendance = await Attendance.findByIdAndDelete(attId);
    if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });
    res.status(200).json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};