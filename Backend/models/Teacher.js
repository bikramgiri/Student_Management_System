// models/Teacher.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  subject: { type: String, required: true, trim: true },
  qualification: { type: String, required: true, trim: true, default: '' },
  experience: { type: Number, min: [0, 'Experience cannot be negative'], default: 0 }, 
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
