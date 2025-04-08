// controllers/feedbackController.js
const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const { role, _id: teacherId } = req.user;

    // Role check
    if (role !== 'Teacher') {
      return res.status(403).json({ message: 'Forbidden: Only Teachers can submit feedback' });
    }

    // Destructure and validate request body
    const { feedback } = req.body;
    if (!feedback || typeof feedback !== 'string' || feedback.trim() === '') {
      return res.status(400).json({ message: 'Feedback is required and must be a non-empty string' });
    }

    // Optional: Limit feedback length
    const trimmedFeedback = feedback.trim();
    if (trimmedFeedback.length > 1000) {
      return res.status(400).json({ message: 'Feedback cannot exceed 1000 characters' });
    }

    // Create and save feedback record with status
    const feedbackDoc = new Feedback({
      teacher: teacherId,
      feedback: trimmedFeedback,
      status: 'Pending',
    });
    await feedbackDoc.save();

    // Populate teacher data
    await feedbackDoc.populate('teacher', 'name email');

    if (!feedbackDoc.teacher) {
      return res.status(500).json({ message: 'Teacher data not found for feedback' });
    }

    // Return success response with populated data
    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        _id: feedbackDoc._id,
        teacher: feedbackDoc.teacher, // Now includes { _id, name, email }
        feedback: feedbackDoc.feedback,
        status: feedbackDoc.status,
        createdAt: feedbackDoc.createdAt,
      },
    });
  } catch (error) {
    console.error('Error submitting feedback:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { role } = req.user;

    // Role check
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admins can update feedback status' });
    }

    // Destructure and validate request body
    const { status } = req.body;
    if (!status || !['Pending', 'Reviewed'].includes(status)) {
      return res.status(400).json({ message: 'Status is required and must be "Pending" or "Reviewed"' });
    }

    // Update feedback status and populate teacher data
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('teacher', 'name email');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (!feedback.teacher) {
      return res.status(500).json({ message: 'Teacher data not found for feedback' });
    }

    // Return success response with populated data
    res.status(200).json({
      message: 'Feedback status updated successfully',
      feedback: {
        _id: feedback._id,
        teacher: feedback.teacher, // Now includes { _id, name, email }
        feedback: feedback.feedback,
        status: feedback.status,
        createdAt: feedback.createdAt,
        updatedAt: feedback.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating feedback status:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid feedback ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fetch all feedbacks (for Admin)
exports.getFeedbacks = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only Admins can view feedbacks' });
    }
    const feedbacks = await Feedback.find().populate('teacher', 'name email');
    if (feedbacks.some(fb => !fb.teacher)) {
      console.warn('Some feedbacks have missing teacher data');
    }
    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error('Error fetching feedbacks:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};