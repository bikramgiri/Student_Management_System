import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fetchStudents } from '../../redux/studentSlice';
import { fetchTeachers } from '../../redux/teacherSlice';
import { fetchCourses } from '../../redux/courseSlice';
import { fetchFeedbacks } from '../../redux/feedbackSlice'; // , updateFeedbackStatus

function AdminDashboard() {
  const dispatch = useDispatch();
  const { students, loading: studentsLoading, error: studentsError } = useSelector((state) => state.students);
  const { teachers, loading: teachersLoading, error: teachersError } = useSelector((state) => state.teachers);
  const { courses, loading: coursesLoading, error: coursesError } = useSelector((state) => state.courses);
  const { feedbacks, loading: feedbackLoading, error: feedbackError } = useSelector((state) => state.feedback);
  const [setMessage] = useState(''); //message,
  // const [updatingFeedbackId, setUpdatingFeedbackId] = useState(null); // Track feedback being updated

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchTeachers());
    dispatch(fetchCourses());
    dispatch(fetchFeedbacks());
  }, [dispatch]);

  const summaryData = [
    { name: 'Students', count: students.length },
    { name: 'Teachers', count: teachers.length },
    { name: 'Courses', count: courses.length },
    { name: 'Pending Feedbacks', count: feedbacks.filter(fb => fb.status === 'Pending').length },
  ];

  // const handleUpdateStatus = (id, newStatus) => {
  //   setUpdatingFeedbackId(id);
  //   dispatch(updateFeedbackStatus({ id, status: newStatus })).then((result) => {
  //     setUpdatingFeedbackId(null);
  //     if (result.meta.requestStatus === 'fulfilled') {
  //       setMessage(`Feedback ${id} status updated to ${newStatus}`);
  //       setTimeout(() => setMessage(''), 3000);
  //     } else {
  //       setMessage(`Failed to update feedback: ${result.payload}`);
  //       setTimeout(() => setMessage(''), 5000);
  //     }
  //   });
  // };

  const handleRefresh = () => {
    setMessage('Refreshing data...');
    Promise.all([
      dispatch(fetchStudents()),
      dispatch(fetchTeachers()),
      dispatch(fetchCourses()),
      dispatch(fetchFeedbacks()),
    ]).then(() => {
      setMessage('Data refreshed successfully');
      setTimeout(() => setMessage(''), 2000);
    }).catch(() => {
      setMessage('Failed to refresh some data');
      setTimeout(() => setMessage(''), 5000);
    });
  };

  const isLoading = studentsLoading || teachersLoading || coursesLoading || feedbackLoading;
  const hasError = studentsError || teachersError || coursesError || feedbackError;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Navigation Links */}
      <div className="space-y-2 mb-6">
        <Link to="/admin/manage-students" className="text-blue-500 underline block hover:text-blue-700">Manage Students</Link>
        <Link to="/admin/manage-teachers" className="text-blue-500 underline block hover:text-blue-700">Manage Teachers</Link>
        <Link to="/admin/manage-courses" className="text-blue-500 underline block hover:text-blue-700">Manage Courses</Link>
        <Link to="/admin/manage-feedbacks" className="text-blue-500 underline block hover:text-blue-700">Manage Feedbacks</Link>
      </div>

      {/* Summary Chart Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Summary Charts</h2>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        {isLoading ? (
          <p className="text-gray-500">Loading summary data...</p>
        ) : hasError ? (
          <p className="text-red-500">
            {studentsError || teachersError || coursesError || feedbackError}
          </p>
        ) : (
          <BarChart width={600} height={300} data={summaryData} className="mx-auto">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        )}
      </div>

      {/* Feedback Management Section */}
      {/* <div>
        <h2 className="text-xl font-semibold mb-4">Feedback Management</h2>
        {message && (
          <p className={`${message.includes('updated') || message.includes('refreshed') ? 'text-green-600' : 'text-red-500'} mb-2`}>
            {message}
          </p>
        )}
        {feedbackLoading && !updatingFeedbackId ? (
          <p className="text-gray-500">Loading feedbacks...</p>
        ) : feedbackError ? (
          <p className="text-red-500">{feedbackError}</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-gray-500">No feedback available</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Teacher</th>
                <th className="border p-2">Feedback</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Created At</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb._id} className="hover:bg-gray-100">
                  <td className="border p-2">
                    {fb.teacher?.name || 'Unknown'} ({fb.teacher?.email || 'N/A'})
                  </td>
                  <td className="border p-2 truncate max-w-xs">{fb.feedback}</td>
                  <td className="border p-2">{fb.status}</td>
                  <td className="border p-2">{new Date(fb.createdAt).toLocaleString()}</td>
                  <td className="border p-2 flex gap-2">
                    {fb.status === 'Pending' ? (
                      <button
                        onClick={() => handleUpdateStatus(fb._id, 'Reviewed')}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:bg-gray-400"
                        disabled={updatingFeedbackId === fb._id}
                      >
                        {updatingFeedbackId === fb._id ? 'Updating...' : 'Mark Reviewed'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(fb._id, 'Pending')}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 disabled:bg-gray-400"
                        disabled={updatingFeedbackId === fb._id}
                      >
                        {updatingFeedbackId === fb._id ? 'Updating...' : 'Revert to Pending'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div> */}
    </div>
  );
}

export default AdminDashboard;