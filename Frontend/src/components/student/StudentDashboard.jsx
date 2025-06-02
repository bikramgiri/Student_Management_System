// src/components/student/StudentDashboard.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitLeave, fetchLeaves } from '../../redux/leaveSlice';
import { fetchResults } from '../../redux/resultSlice';
import { fetchAttendance } from '../../redux/attendanceSlice';

function StudentDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { results, loading: resultsLoading, error: resultsError } = useSelector((state) => state.results);
  const { attendances, loading: attendanceLoading, error: attendanceError } = useSelector((state) => state.attendance);
  const { leaves, loading: leavesLoading, error: leavesError } = useSelector((state) => state.leaves);

  const [activeTab, setActiveTab] = useState('attendance');
  const ADMIN_ID = 'your-admin-id-here'; // Replace with a real admin ID from your database

  useEffect(() => {
    console.log('StudentDashboard mounted');
    return () => console.log('StudentDashboard unmounted');
  }, []);

  const fetchData = useCallback(() => {
    console.log('Fetching initial data');
    dispatch(fetchResults());
    dispatch(fetchAttendance());
    dispatch(fetchLeaves());
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const AttendanceDisplay = memo(() => {
    console.log('AttendanceDisplay rendered');
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Attendance</h2>
        {attendanceLoading ? <p>Loading...</p> : attendanceError ? (
          <p className="text-red-500">Error: {attendanceError}</p>
        ) : attendances.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <ul className="space-y-2">
            {attendances.map((record, index) => (
              <li key={index} className="flex justify-between">
                <span>{new Date(record.date).toLocaleDateString()}</span>
                <span className={`font-medium ${record.status === 'Present' ? 'text-green-600' : 'text-red-600'}`}>
                  {record.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  });

  const ResultsDisplay = memo(() => {
    console.log('ResultsDisplay rendered');
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Results</h2>
        {resultsLoading ? <p>Loading...</p> : resultsError ? (
          <p className="text-red-500">Error: {resultsError}</p>
        ) : results.length === 0 ? (
          <p>No results available.</p>
        ) : (
          <ul className="space-y-2">
            {results.map((result, index) => (
              <li key={index} className="flex justify-between">
                <span>{result.subject}</span>
                <span className="font-medium">{result.marks}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  });

  const LeaveApplication = memo(({ leaves, leavesLoading, leavesError }) => {
    const dispatch = useDispatch();
    const { _id: studentId } = useSelector((state) => state.auth.user);
    const [leaveForm, setLeaveForm] = useState({ date: '', reason: '', admin: ADMIN_ID });
    const [message, setMessage] = useState('');

    const handleChange = useCallback((e) => {
      const { name, value } = e.target;
      console.log(`LeaveApplication handleChange: ${name}=${value}`);
      setLeaveForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback((e) => {
      e.preventDefault();
      console.log('Submitting leave:', leaveForm);
      dispatch(submitLeave({ ...leaveForm, studentId })).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          setMessage('Leave application submitted successfully!');
          setLeaveForm({ date: '', reason: '', admin: ADMIN_ID });
          dispatch(fetchLeaves());
        } else {
          setMessage(result.payload);
        }
        setTimeout(() => setMessage(''), 3000);
      });
    }, [dispatch, leaveForm, studentId]);

    const handleRefresh = useCallback(() => {
      setMessage('Refreshing leave status...');
      dispatch(fetchLeaves()).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          setMessage('Leave status refreshed successfully');
          setTimeout(() => setMessage(''), 2000);
        } else {
          setMessage('Failed to refresh leave status');
          setTimeout(() => setMessage(''), 5000);
        }
      });
    }, [dispatch]);

    console.log('LeaveApplication rendered');
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Leave Application</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={leaveForm.date}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Recipient</label>
            <select
              name="admin"
              value={leaveForm.admin}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Admin</option>
              <option value={ADMIN_ID}>Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Reason</label>
            <textarea
              name="reason"
              value={leaveForm.reason}
              onChange={handleChange}
              placeholder="Enter your reason..."
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={!leaveForm.admin || leavesLoading}
          >
            Submit
          </button>
        </form>
        {message && (
          <p className={`mt-2 ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>
        )}
        <div className="mt-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Leave Status</h3>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={leavesLoading}
          >
            {leavesLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {leavesLoading ? <p>Loading...</p> : leavesError ? (
          <p className="text-red-500">Error: {leavesError}</p>
        ) : leaves.length === 0 ? (
          <p>No leave applications submitted.</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {leaves.map((leave) => (
              <li key={leave._id} className="flex justify-between items-center">
                <span>{new Date(leave.date).toLocaleDateString()} - {leave.reason}</span>
                <span
                  className={`font-medium ${
                    leave.status === 'Approved' ? 'text-green-600' : leave.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}
                >
                  {leave.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  });

  const Chat = memo(({ userId }) => {
    const [chat, setChat] = useState({ recipient: '', messages: [], input: '' });

    const handleChatChange = useCallback((e) => {
      console.log(`Chat handleChange: input=${e.target.value}`);
      setChat((prev) => ({ ...prev, input: e.target.value }));
    }, []);

    const handleChatSubmit = useCallback((e) => {
      e.preventDefault();
      if (chat.input.trim() && chat.recipient) {
        setChat((prev) => ({
          ...prev,
          messages: [...prev.messages, { sender: userId, text: prev.input, timestamp: new Date() }],
          input: '',
        }));
        console.log(`Message to ${chat.recipient}: ${chat.input}`);
      }
    }, [chat.input, chat.recipient, userId]);

    console.log('Chat rendered');
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Chat</h2>
        <select
          value={chat.recipient}
          onChange={(e) => setChat((prev) => ({ ...prev, recipient: e.target.value, messages: [] }))}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">Select Recipient</option>
          <option value={ADMIN_ID}>Admin</option>
        </select>
        {chat.recipient ? (
          <>
            <div className="h-64 overflow-y-auto border p-2 rounded mb-4">
              {chat.messages.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.sender === userId ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded ${msg.sender === userId ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {msg.text}
                  </span>
                  <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chat.input}
                onChange={handleChatChange}
                placeholder="Type a message..."
                className="flex-grow border p-2 rounded"
              />
              <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Send
              </button>
            </form>
          </>
        ) : (
          <p>Select a recipient to start chatting.</p>
        )}
      </div>
    );
  });

  console.log('StudentDashboard rendered');
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
      <div className="flex space-x-4 mb-6 border-b">
        {['attendance', 'results', 'leave', 'chat'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {activeTab === 'attendance' && <AttendanceDisplay />}
      {activeTab === 'results' && <ResultsDisplay />}
      {activeTab === 'leave' && <LeaveApplication leaves={leaves} leavesLoading={leavesLoading} leavesError={leavesError} />}
      {activeTab === 'chat' && <Chat userId={user._id} />}
    </div>
  );
}

export default StudentDashboard;