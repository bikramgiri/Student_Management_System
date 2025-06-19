import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitTeacherLeave, fetchAllLeaves, updateTeacherLeave, deleteLeave } from '../../redux/leaveSlice';
import { fetchStudentsForAttendance } from '../../redux/attendanceSlice'; // For admin reference, optional

function ApplyForLeave() {
  const dispatch = useDispatch();
  const { leaves, loading, error } = useSelector((state) => state.leaves);
  const [leaveData, setLeaveData] = useState({ date: '', reason: '' });
  const [editData, setEditData] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchAllLeaves());
    dispatch(fetchStudentsForAttendance()); // Optional, for admin context
  }, [dispatch]);

  const handleChange = (e) => setLeaveData({ ...leaveData, [e.target.name]: e.target.value });

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    const currentDate = new Date().toLocaleDateString();
    const submitData = { ...leaveData, date: currentDate };
    dispatch(submitTeacherLeave(submitData))
      .then(() => {
        setMessage('Leave application submitted successfully');
        setLeaveData({ date: '', reason: '' });
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(() => {
        setMessage('Failed to submit leave application');
        setTimeout(() => setMessage(''), 5000);
      });
  };

  const handleEditLeave = (leave) => {
    setEditData({
      _id: leave._id,
      date: new Date(leave.date).toLocaleDateString(),
      reason: leave.reason,
    });
  };

  const handleUpdateLeave = (e) => {
    e.preventDefault();
    dispatch(updateTeacherLeave({ id: editData._id, reason: editData.reason }))
      .then(() => {
        dispatch(fetchAllLeaves());
        setMessage('Leave reason updated successfully');
        setEditData(null);
        setTimeout(() => setMessage(''), 3000);
      })
      .catch(() => {
        setMessage('Failed to update leave reason');
        setTimeout(() => setMessage(''), 5000);
      });
  };

  const handleDeleteLeave = (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      dispatch(deleteLeave(id))
        .then(() => {
          setMessage('Leave request deleted successfully');
          setTimeout(() => setMessage(''), 3000);
        })
        .catch(() => {
          setMessage('Failed to delete leave request');
          setTimeout(() => setMessage(''), 5000);
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Apply for Leave</h1>
      {message && (
        <p className={`${message.includes('successfully') ? 'text-green-600' : 'text-red-500'} mb-2`}>{message}</p>
      )}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <form onSubmit={handleSubmitLeave} className="mb-6 flex flex-col gap-2">
            <input
              type="date"
              name="date"
              value={leaveData.date}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
            <textarea
              name="reason"
              value={leaveData.reason}
              onChange={handleChange}
              placeholder="Enter your reason for leave..."
              className="border p-2 rounded h-24"
              required
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Leave Application'}
            </button>
          </form>
          {leaves.length > 0 && (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Teacher</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Reason</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-100">
                    <td className="border p-2">{leave.teacher?.name || 'N/A'}</td>
                    <td className="border p-2">{new Date(leave.date).toLocaleDateString()}</td>
                    <td className="border p-2">{leave.reason}</td>
                    <td className="border p-2">{leave.status}</td>
                    <td className="border p-2 flex gap-2">
                      <button
                        onClick={() => handleEditLeave(leave)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLeave(leave._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {editData && (
            <div className="mt-6 bg-white p-6 rounded shadow max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Leave Reason</h2>
              <form onSubmit={handleUpdateLeave} className="space-y-4">
                <input
                  type="text"
                  name="date"
                  value={editData.date}
                  disabled
                  className="mt-1 block w-full border p-2 rounded bg-gray-100"
                />
                <textarea
                  name="reason"
                  value={editData.reason}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded h-24"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Update Reason'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditData(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ApplyForLeave;