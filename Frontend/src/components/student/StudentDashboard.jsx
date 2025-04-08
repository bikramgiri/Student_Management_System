import React, { useState, useEffect } from 'react';

// Simulated Attendance Component
function AttendanceDisplay() {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    // Simulate API call with a delay
    setTimeout(() => {
      setAttendance([
        { date: '2025-04-01', status: 'Present' },
        { date: '2025-04-02', status: 'Absent' },
        { date: '2025-04-03', status: 'Present' },
      ]);
    }, 1000);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Attendance</h2>
      {attendance.length === 0 ? (
        <p>Loading attendance...</p>
      ) : (
        <ul className="list-disc ml-6">
          {attendance.map((record, index) => (
            <li key={index}>
              {record.date}: <span className="font-medium">{record.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Simulated Results Component
function ResultsDisplay() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Simulate API call with a delay
    setTimeout(() => {
      setResults([
        { subject: 'Math', marks: 85 },
        { subject: 'Science', marks: 90 },
        { subject: 'English', marks: 78 },
      ]);
    }, 1000);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Results</h2>
      {results.length === 0 ? (
        <p>Loading results...</p>
      ) : (
        <ul className="list-disc ml-6">
          {results.map((result, index) => (
            <li key={index}>
              {result.subject}: <span className="font-medium">{result.marks}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Leave Application Form Component
function LeaveApplicationForm() {
  const [formData, setFormData] = useState({ date: '', reason: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission API call
    console.log("Leave application submitted:", formData);
    setMessage("Leave application submitted successfully!");
    // Reset form fields
    setFormData({ date: '', reason: '' });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Leave Application</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Enter your reason for leave..."
          className="border p-2 rounded"
          required
        ></textarea>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Submit Leave Application
        </button>
      </form>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}

// Feedback Form Component
function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [responseMsg, setResponseMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call to submit feedback
    console.log("Feedback submitted:", feedback);
    setResponseMsg("Feedback submitted successfully!");
    setFeedback('');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Feedback</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback here..."
          className="border p-2 rounded"
          required
        ></textarea>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Submit Feedback
        </button>
      </form>
      {responseMsg && <p className="mt-2 text-green-600">{responseMsg}</p>}
    </div>
  );
}

function StudentDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      
      {/* Attendance Section */}
      <div className="mt-4 border p-4 rounded shadow">
        <AttendanceDisplay />
      </div>
      
      {/* Results Section */}
      <div className="mt-4 border p-4 rounded shadow">
        <ResultsDisplay />
      </div>
      
      {/* Leave Application Section */}
      <div className="mt-4 border p-4 rounded shadow">
        <LeaveApplicationForm />
      </div>
      
      {/* Feedback Section */}
      <div className="mt-4 border p-4 rounded shadow">
        <FeedbackForm />
      </div>
    </div>
  );
}

export default StudentDashboard;
