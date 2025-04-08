// models/Student.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  enrollmentNumber: { type: String, required: true, trim: true },
  class: { type: String, required: true, trim: true, default: '' },
  section: { type: String, required: true, trim: true, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
