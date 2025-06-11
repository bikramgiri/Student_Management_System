// models/Result.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resultSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Student ID is required'],
  },
  subject: { 
    type: String, 
    required: [true, 'Subject is required'],
    trim: true,
    minlength: [2, 'Subject must be at least 2 characters long'],
  },
  marks: { 
    type: Number, 
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be less than 0'],
    max: [100, 'Marks cannot exceed 100'],
  },
  teacher: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Teacher ID is required'],
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Index for faster queries
resultSchema.index({ student: 1, subject: 1 });
resultSchema.index({ teacher: 1 });

module.exports = mongoose.model('Result', resultSchema);


// OR


// const mongoose = require('mongoose');

// const resultSchema = new mongoose.Schema({
//   student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
//   marks: { type: Number, required: true },
// }, { timestamps: true });

// module.exports = mongoose.model('Result', resultSchema);
