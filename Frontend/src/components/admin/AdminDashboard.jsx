// src/components/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fetchStudents } from '../../redux/studentSlice';
import { fetchTeachers } from '../../redux/teacherSlice';
import { fetchCourses } from '../../redux/courseSlice';
import { fetchAllLeaves } from '../../redux/leaveSlice';
import { fetchAttendanceSummary } from '../../redux/attendanceSummarySlice';
import { fetchResultsSummary } from '../../redux/resultsSummarySlice';

function AdminDashboard() {
  const dispatch = useDispatch();
  const { students, loading: studentsLoading, error: studentsError } = useSelector((state) => state.students);
  const { teachers, loading: teachersLoading, error: teachersError } = useSelector((state) => state.teachers);
  const { courses, loading: coursesLoading, error: coursesError } = useSelector((state) => state.courses);
  const { leaves, loading: leavesLoading, error: leavesError } = useSelector((state) => state.leaves);
  const { data: attendanceData, loading: attendanceLoading, error: attendanceError } = useSelector((state) => state.attendanceSummary);
  const { data: resultsData, loading: resultsLoading, error: resultsError } = useSelector((state) => state.resultsSummary);
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchTeachers());
    dispatch(fetchCourses());
    dispatch(fetchAllLeaves());
    dispatch(fetchAttendanceSummary());
    dispatch(fetchResultsSummary());
  }, [dispatch]);

  const summaryData = [
    { name: 'Students', count: students.length },
    { name: 'Teachers', count: teachers.length },
    { name: 'Subjects', count: courses.length },
    { name: 'Pending Leaves', count: leaves.filter(leave => leave.status === 'Pending').length },
  ];

  const handleRefresh = () => {
    setMessage('Refreshing data...');
    Promise.all([
      dispatch(fetchStudents()),
      dispatch(fetchTeachers()),
      dispatch(fetchCourses()),
      dispatch(fetchAllLeaves()),
      dispatch(fetchAttendanceSummary()),
      dispatch(fetchResultsSummary()),
    ]).then(() => {
      setMessage('Data refreshed successfully');
      setTimeout(() => setMessage(''), 2000);
    }).catch(() => {
      setMessage('Failed to refresh some data');
      setTimeout(() => setMessage(''), 5000);
    });
  };

  const isLoading = studentsLoading || teachersLoading || coursesLoading || leavesLoading;
  const hasError = studentsError || teachersError || coursesError || leavesError;

  const BarChartComponent = ({ data, xKey, yKey, barColor }) => (
    <BarChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey={yKey} fill={barColor} />
    </BarChart>
  );

  return (
    <div className="flex-1 p-6 bg-gray-100">
      <div className="mb-4">
        <p className="text-blue-500">Home / Administrative Dashboard</p>
        <h1 className="text-2xl font-bold">Administrative Dashboard</h1>
      </div>

      {message && <p className="mb-4 text-gray-700">{message}</p>}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-teal-500 text-white p-4 rounded shadow">
          <p className="text-lg">Total Students</p>
          <p className="text-2xl">{students.length}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded shadow">
          <p className="text-lg">Total Teachers</p>
          <p className="text-2xl">{teachers.length}</p>
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded shadow">
          <p className="text-lg">Total Subjects</p>
          <p className="text-2xl">{courses.length}</p>
        </div>
        <div className="bg-red-500 text-white p-4 rounded shadow">
          <p className="text-lg">Pending Leaves</p>
          <p className="text-2xl">{leaves.filter(leave => leave.status === 'Pending').length}</p>
        </div>
      </div>

      <button
        onClick={handleRefresh}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-6"
      >
        Refresh Data
      </button>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Summary Charts</h2>
        {isLoading ? (
          <p className="text-gray-500">Loading summary data...</p>
        ) : hasError ? (
          <p className="text-red-500">{studentsError || teachersError || coursesError || leavesError}</p>
        ) : (
          <BarChartComponent data={summaryData} xKey="name" yKey="count" barColor="#8884d8" />
        )}
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Today's Attendance</h2>
        {attendanceLoading ? (
          <p className="text-gray-500">Loading attendance data...</p>
        ) : attendanceError ? (
          <p className="text-red-500">{attendanceError}</p>
        ) : Object.keys(attendanceData).some(key => attendanceData[key] > 0) ? (
          <BarChartComponent data={[
            { name: 'Present', count: attendanceData.present },
            { name: 'Absent', count: attendanceData.absent },
            { name: 'Late', count: attendanceData.late },
          ]} xKey="name" yKey="count" barColor="#82ca9d" />
        ) : (
          <p className="text-gray-500">No attendance data available</p>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Average Marks per Subject</h2>
        {resultsLoading ? (
          <p className="text-gray-500">Loading results data...</p>
        ) : resultsError ? (
          <p className="text-red-500">{resultsError}</p>
        ) : resultsData.length > 0 ? (
          <BarChartComponent data={resultsData} xKey="subject" yKey="average" barColor="#ffc658" />
        ) : (
          <p className="text-gray-500">No results data available</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;