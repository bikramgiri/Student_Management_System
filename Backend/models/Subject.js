// models/Subject.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
  title: { type: String, required: true, trim: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
}, { timestamps: true });

// Explicitly ensure no unique index on teacher
subjectSchema.index({ teacher: 1 }, { unique: false });

module.exports = mongoose.model('Subject', subjectSchema);