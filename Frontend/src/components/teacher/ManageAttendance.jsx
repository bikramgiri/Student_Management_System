import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentsForAttendance, submitAttendance, fetchAttendanceRecords, updateAttendance, deleteAttendance } from '../../redux/attendanceSlice';

function ManageAttendance() {
  const dispatch = useDispatch();
  const { students, attendances, loading, error } = useSelector((state) => state.attendance);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState('');
  const [editRecord, setEditRecord] = useState(null);

  useEffect(() => {
    dispatch(fetchStudentsForAttendance());
    dispatch(fetchAttendanceRecords());
  }, [dispatch]);

  const handleMarkAttendance = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmitAttendance = (e) => {
    e.preventDefault();
    const currentDate = new Date('2025-06-19T11:30:00+05:45').toLocaleDateString();
    const attendanceData = { date: currentDate, records: attendance };
    dispatch(submitAttendance(attendanceData))
      .then((action) => {
        const payload = action.payload;
        setMessage(payload.message || 'Attendance added successfully');
        setAttendance({});
        dispatch(fetchAttendanceRecords()); // Sync with backend
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((action) => {
        const payload = action.payload;
        setMessage(payload || 'Failed to submit attendance');
        setTimeout(() => setMessage(''), 5000);
      });
  };

  const handleEdit = (attId, studentId, currentStatus) => {
    setEditRecord({ attId, studentId, status: currentStatus });
  };

  const handleUpdateAttendance = (e) => {
    e.preventDefault();
    dispatch(updateAttendance(editRecord))
      .then((action) => {
        const payload = action.payload;
        setMessage(payload.message || 'Attendance updated successfully');
        setEditRecord(null);
        dispatch(fetchAttendanceRecords()); // Refresh to update existingAttendance
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((action) => {
        const payload = action.payload;
        setMessage(payload || 'Failed to update attendance');
        setTimeout(() => setMessage(''), 5000);
      });
  };

  const handleDelete = (attId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      dispatch(deleteAttendance(attId))
        .then((action) => {
          const payload = action.payload;
          setMessage(payload.message || 'Attendance deleted successfully');
          dispatch(fetchAttendanceRecords()); // Refresh to re-enable select for deleted student
          setTimeout(() => setMessage(''), 3000);
        })
        .catch((action) => {
          const payload = action.payload;
          setMessage(payload || 'Failed to delete attendance');
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
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-2">
            {students.map((student) => (
              <div key={student._id} className="flex items-center gap-2 mb-2">
                <span className="w-40">{student.name}</span>
                <select
                  value={attendance[student._id] || ''}
                  onChange={(e) => handleMarkAttendance(student._id, e.target.value)}
                  className="border p-2 rounded"
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
              disabled={loading || Object.keys(attendance).length === 0}
            >
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>

          {editRecord && (
            <div className="mt-6 bg-white p-6 rounded shadow max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Attendance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editRecord.status}
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
                  <th className="border p-2">Name</th>
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
                      <tr key={record._id} className="hover:bg-gray-100">
                        <td className="border p-2">{studentName}</td>
                        <td className="border p-2">{new Date(att.date).toLocaleDateString()}</td>
                        <td className="border p-2">{record.status}</td>
                        <td className="border p-2 flex gap-2">
                          <button
                            onClick={() => handleEdit(att._id, record.student._id || record.student, record.status)}
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
          ) : null}
        </>
      )}
    </div>
  );
}

export default ManageAttendance;