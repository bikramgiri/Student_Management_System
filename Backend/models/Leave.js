// models/Leave.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaveSchema = new Schema({
      teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      date: { type: Date, required: true },
      reason: { type: String, required: true },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
        required: true,
      },
    }, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);