import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitResult, fetchResults, deleteResult } from '../../redux/resultSlice';
import { fetchSubjects } from '../../redux/subjectSlice';
import { fetchStudentsForAttendance } from '../../redux/attendanceSlice';
import { fetchProfile } from '../../redux/authSlice';

function ManageResult() {
  const dispatch = useDispatch();
  const { results, loading, error } = useSelector((state) => state.results);
  const { students } = useSelector((state) => state.attendance);
  const { subjects } = useSelector((state) => state.subjects);
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const [resultData, setResultData] = useState({ studentId: '', subject: '', marks: '' });
  const [editData, setEditData] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && (!user || !user.role)) {
        await dispatch(fetchProfile()).unwrap();
      }
      if (!authLoading && user && user.role) {
        await Promise.all([
          dispatch(fetchResults()),
          dispatch(fetchSubjects()),
          dispatch(fetchStudentsForAttendance()),
        ]);
      }
    };
    fetchData();
  }, [dispatch, authLoading, user?.role]);

  const handleChange = (e) => setResultData({ ...resultData, [e.target.name]: e.target.value });

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSubmitResults = (e) => {
    e.preventDefault();
    dispatch(submitResult(resultData)).then(() => {
      setMessage('Result added successfully');
      setResultData({ studentId: '', subject: '', marks: '' });
      setTimeout(() => setMessage(''), 3000);
    }).catch(() => {
      setMessage('Failed to add result');
      setTimeout(() => setMessage(''), 5000);
    });
  };

  const handleEditResult = (result) => {
    setEditData({
      _id: result._id,
      studentId: result.student?._id,
      subject: result.subject,
      marks: result.marks,
    });
  };

  const handleUpdateResult = (e) => {
    e.preventDefault();
    dispatch(submitResult(editData)).then(() => {
      dispatch(fetchResults());
      setMessage('Result updated successfully');
      setEditData(null);
      setTimeout(() => setMessage(''), 3000);
    }).catch(() => {
      setMessage('Failed to update result');
      setTimeout(() => setMessage(''), 5000);
    });
  };

  const handleDeleteResult = (id) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      dispatch(deleteResult(id)).then(() => {
        setMessage('Result deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      }).catch(() => {
        setMessage('Failed to delete result');
        setTimeout(() => setMessage(''), 5000);
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Result</h1>
      {message && (
        <p className={`${message.includes('successfully') ? 'text-green-600' : 'text-red-500'} mb-2`}>{message}</p>
      )}
      {authLoading || loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <form onSubmit={handleSubmitResults} className="mb-6 flex flex-col gap-2">
            <select
              name="studentId"
              value={resultData.studentId}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>{student.name}</option>
              ))}
            </select>
            <select
              name="subject"
              value={resultData.subject}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject.title}>{subject.title}</option>
              ))}
            </select>
            <input
              type="number"
              name="marks"
              value={resultData.marks}
              onChange={handleChange}
              placeholder="Marks (0-100)"
              className="border p-2 rounded"
              min="0"
              max="100"
              required
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Result'}
            </button>
          </form>
          {results.length > 0 && (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Student</th>
                  <th className="border p-2">Subject</th>
                  <th className="border p-2">Marks</th>
                  <th className="border p-2">Pass/Fail</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id} className="hover:bg-gray-100">
                    <td className="border p-2">{result.student?.name || 'N/A'}</td>
                    <td className="border p-2">{result.subject}</td>
                    <td className="border p-2">{result.marks}</td>
                    <td className="border p-2">{result.marks >= 40 ? 'Pass' : 'Fail'}</td>
                    <td className="border p-2 flex gap-2">
                      <button
                        onClick={() => handleEditResult(result)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteResult(result._id)}
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
              <h2 className="text-xl font-semibold mb-4">Edit Result</h2>
              <form onSubmit={handleUpdateResult} className="space-y-4">
                <select
                  name="studentId"
                  value={editData.studentId}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>{student.name}</option>
                  ))}
                </select>
                <select
                  name="subject"
                  value={editData.subject}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject.title}>{subject.title}</option>
                  ))}
                </select>
                <input
                  type="number"
                  name="marks"
                  value={editData.marks}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                  min="0"
                  max="100"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Update Result'}
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

export default ManageResult;