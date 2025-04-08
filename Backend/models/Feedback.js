// models/Feedback.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  feedback: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed'], // Restrict to these values
    default: 'Pending', // Default to "Pending" for new feedback
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);