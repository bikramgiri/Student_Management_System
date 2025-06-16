// models/Teacher.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  address: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true, trim: true, match: [/^\+?[\d\s-]{10,}$/, 'Please provide a valid contact number'] },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);