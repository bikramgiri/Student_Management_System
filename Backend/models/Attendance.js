// models/Attendance.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  date: { type: Date, required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  records: { type: Map, of: String, required: true }, // { studentId: status }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);