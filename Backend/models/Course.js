const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true, unique: true }, // Required for clarity
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);