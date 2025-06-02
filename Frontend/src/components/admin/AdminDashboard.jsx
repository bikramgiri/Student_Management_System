// src/components/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fetchStudents } from '../../redux/studentSlice';
import { fetchTeachers } from '../../redux/teacherSlice';
import { fetchCourses } from '../../redux/courseSlice';
import { fetchFeedbacks } from '../../redux/feedbackSlice';
import { fetchAllLeaves } from '../../redux/leaveSlice'; // Add this import

function AdminDashboard() {
  const dispatch = useDispatch();
  const { students, loading: studentsLoading, error: studentsError } = useSelector((state) => state.students);
  const { teachers, loading: teachersLoading, error: teachersError } = useSelector((state) => state.teachers);
  const { courses, loading: coursesLoading, error: coursesError } = useSelector((state) => state.courses);
  const { feedbacks, loading: feedbackLoading, error: feedbackError } = useSelector((state) => state.feedback);
  const { leaves, loading: leavesLoading, error: leavesError } = useSelector((state) => state.leaves);
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchTeachers());
    dispatch(fetchCourses());
    dispatch(fetchFeedbacks());
    dispatch(fetchAllLeaves());
  }, [dispatch]);

  const summaryData = [
    { name: 'Students', count: students.length },
    { name: 'Teachers', count: teachers.length },
    { name: 'Courses', count: courses.length },
    { name: 'Pending Feedbacks', count: feedbacks.filter(fb => fb.status === 'Pending').length },
    { name: 'Pending Leaves', count: leaves.filter(leave => leave.status === 'Pending').length },
  ];

  const handleRefresh = () => {
    setMessage('Refreshing data...');
    Promise.all([
      dispatch(fetchStudents()),
      dispatch(fetchTeachers()),
      dispatch(fetchCourses()),
      dispatch(fetchFeedbacks()),
      dispatch(fetchAllLeaves()),
    ]).then(() => {
      setMessage('Data refreshed successfully');
      setTimeout(() => setMessage(''), 2000);
    }).catch(() => {
      setMessage('Failed to refresh some data');
      setTimeout(() => setMessage(''), 5000);
    });
  };

  const isLoading = studentsLoading || teachersLoading || coursesLoading || feedbackLoading || leavesLoading;
  const hasError = studentsError || teachersError || coursesError || feedbackError || leavesError;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="space-y-2 mb-6">
        <Link to="/admin/manage-students" className="text-blue-500 underline block hover:text-blue-700">Manage Students</Link>
        <Link to="/admin/manage-teachers" className="text-blue-500 underline block hover:text-blue-700">Manage Teachers</Link>
        <Link to="/admin/manage-courses" className="text-blue-500 underline block hover:text-blue-700">Manage Courses</Link>
        <Link to="/admin/manage-feedbacks" className="text-blue-500 underline block hover:text-blue-700">Manage Feedbacks</Link>
        <Link to="/admin/manage-leaves" className="text-blue-500 underline block hover:text-blue-700">Manage Leaves</Link>
      </div>

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
        {message && (
          <p className={`${message.includes('successfully') ? 'text-green-600' : 'text-red-500'} mb-2`}>{message}</p>
        )}
        {isLoading ? (
          <p className="text-gray-500">Loading summary data...</p>
        ) : hasError ? (
          <p className="text-red-500">
            {studentsError || teachersError || coursesError || feedbackError || leavesError}
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
    </div>
  );
}

export default AdminDashboard;