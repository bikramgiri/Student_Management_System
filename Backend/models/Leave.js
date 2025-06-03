// models/Leave.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const leaveSchema = new Schema({
//   student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   teacher: { type: Schema.Types.ObjectId, ref: 'User', required: false },
//   date: { type: Date, required: true },
//   reason: { type: String, required: true, trim: true, maxlength: 500 },
//   admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   status: {
//     type: String,
//     enum: ['Pending', 'Approved', 'Rejected'],
//     default: 'Pending',
//     required: true,
//   },
// }, { timestamps: true });

const leaveSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // Optional for teacher leaves
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // Optional for student leaves
  date: { type: Date, required: true },
  reason: { type: String, required: true, trim: true, maxlength: 500 },
  admin: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // Optional for teacher leaves
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);