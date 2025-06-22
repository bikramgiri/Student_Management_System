// src/components/teacher/ManageAttendance.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentsForAttendance, submitAttendance, fetchAttendanceRecords, updateAttendance, deleteAttendance } from '../../redux/attendanceSlice';
import { fetchProfile } from '../../redux/authSlice'; // Import fetchSubjects

function ManageAttendance() {
  const dispatch = useDispatch();
  const { students, attendances, loading, error } = useSelector((state) => state.attendance);
  // const { user } = useSelector((state) => state.auth); // Still needed for user context
  const { subjects } = useSelector((state) => state.subjects); // Use subjects from subjectSlice
  const [attendance, setAttendance] = useState({});
  const [selectedSubject, setSelectedSubject] = useState('');
  const [message, setMessage] = useState('');
  const [editRecord, setEditRecord] = useState(null);

  useEffect(() => {
    // Fetch profile and subjects to ensure data is up-to-date
    dispatch(fetchProfile());
    // dispatch(fetchSubjects()); // Sync subjects with backend
    dispatch(fetchStudentsForAttendance());
    dispatch(fetchAttendanceRecords());
  }, [dispatch]);

  const handleMarkAttendance = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status || '',
    }));
  };

  const handleSubmitAttendance = (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      setMessage('Please select a subject');
      setTimeout(() => setMessage(''), 5000);
      return;
    }
    if (Object.keys(attendance).length === 0) {
      setMessage('Please mark attendance for at least one student');
      setTimeout(() => setMessage(''), 5000);
      return;
    }
    const currentDate = new Date().toISOString().split('T')[0]; // 2025-06-22
    const attendanceData = { date: currentDate, subject: selectedSubject, records: attendance };
    dispatch(submitAttendance(attendanceData))
      .then((action) => {
        const payload = action.payload;
        setMessage(payload.message || 'Attendance added successfully');
        setAttendance({});
        setSelectedSubject('');
        dispatch(fetchAttendanceRecords());
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((action) => {
        const payload = action.payload || 'Failed to submit attendance';
        setMessage(payload);
        setTimeout(() => setMessage(''), 5000);
      });
  };

  const handleEdit = (attId, studentId, currentStatus, currentSubject) => {
    setEditRecord({ attId, studentId, status: currentStatus || 'Present', subject: currentSubject || subjects[0]?.title });
  };

  const handleUpdateAttendance = (e) => {
    e.preventDefault();
    if (!editRecord.subject) {
      setMessage('Please select a subject');
      setTimeout(() => setMessage(''), 5000);
      return;
    }
    dispatch(updateAttendance({ attId: editRecord.attId, studentId: editRecord.studentId, status: editRecord.status, subject: editRecord.subject }))
      .then((action) => {
        const payload = action.payload;
        setMessage(payload.message || 'Attendance updated successfully');
        setEditRecord(null);
        dispatch(fetchAttendanceRecords());
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((action) => {
        const payload = action.payload || 'Failed to update attendance';
        setMessage(payload);
        setTimeout(() => setMessage(''), 5000);
      });
  };

  const handleDelete = (attId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      dispatch(deleteAttendance(attId))
        .then((action) => {
          const payload = action.payload;
          setMessage(payload.message || 'Attendance deleted successfully');
          dispatch(fetchAttendanceRecords());
          setTimeout(() => setMessage(''), 3000);
        })
        .catch((action) => {
          const payload = action.payload || 'Failed to delete attendance';
          setMessage(payload);
          setTimeout(() => setMessage(''), 5000);
        });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Attendance</h1>
      {message && (
        <p className={`${message.includes('successfully') ? 'text-green-600' : 'text-red-500'} mb-2`}>
          {message}
        </p>
      )}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                disabled={subjects.length === 0}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject.title}>{subject.title}</option>
                ))}
              </select>
              {subjects.length === 0 && (
                <p className="text-red-500 text-sm mt-1">No subjects assigned. Contact admin to update your profile.</p>
              )}
            </div>
            {students.map((student) => (
              <div key={student._id} className="flex items-center gap-2 mb-2">
                <span className="w-40">{student.name}</span>
                <select
                  value={attendance[student._id] || ''}
                  onChange={(e) => handleMarkAttendance(student._id, e.target.value)}
                  className="border p-2 rounded"
                  disabled={!selectedSubject}
                >
                  <option value="">Select status</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            ))}
            <button
              onClick={handleSubmitAttendance}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={loading || Object.keys(attendance).length === 0 || !selectedSubject || subjects.length === 0}
            >
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>

          {editRecord && (
            <div className="mt-6 bg-white p-6 rounded shadow max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Attendance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <select
                    value={editRecord.subject || ''}
                    onChange={(e) => setEditRecord({ ...editRecord, subject: e.target.value })}
                    className="mt-1 block w-full border p-2 rounded"
                    disabled={subjects.length === 0}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject.title}>{subject.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editRecord.status || 'Present'}
                    onChange={(e) => setEditRecord({ ...editRecord, status: e.target.value })}
                    className="mt-1 block w-full border p-2 rounded"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateAttendance}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={!editRecord.subject || subjects.length === 0}
                  >
                    Update Attendance
                  </button>
                  <button
                    onClick={() => setEditRecord(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {attendances.length > 0 && students.length > 0 ? (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Student Name</th>
                  <th className="border p-2">Subject Name</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((att) =>
                  att.records.map((record) => {
                    const studentName = record.student?.name || students.find((s) => s._id === record.student?.toString())?.name || 'Unknown Student';
                    return (
                      <tr key={`${att._id}-${record._id}`} className="hover:bg-gray-100">
                        <td className="border p-2">{studentName}</td>
                        <td className="border p-2">{att.subject}</td>
                        <td className="border p-2">{new Date(att.date).toLocaleDateString()}</td>
                        <td className="border p-2">{record.status}</td>
                        <td className="border p-2 flex gap-2">
                          <button
                            onClick={() => handleEdit(att._id, record.student._id || record.student, record.status, att.subject)}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(att._id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          ) : attendances.length > 0 && students.length === 0 ? (
            <p className="text-gray-500">Students data not loaded yet. Please wait...</p>
          ) : (
            <p className="text-gray-500">No attendance records available.</p>
          )}
        </>
      )}
    </div>
  );
}

export default ManageAttendance;