import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fetchStudents } from '../../redux/studentSlice';
import { fetchTeachers } from '../../redux/teacherSlice';
import { fetchSubjects } from '../../redux/subjectSlice';
import { fetchAllLeaves } from '../../redux/leaveSlice';
import { fetchAttendanceSummary } from '../../redux/attendanceSummarySlice';
import { fetchResults } from '../../redux/resultSlice';
import { fetchProfile } from '../../redux/authSlice';

function AdminDashboard() {
  const dispatch = useDispatch();
  const { students, loading: studentsLoading, error: studentsError } = useSelector((state) => state.students);
  const { teachers, loading: teachersLoading, error: teachersError } = useSelector((state) => state.teachers);
  const { subjects, loading: subjectsLoading, error: subjectsError } = useSelector((state) => state.subjects);
  const { leaves, loading: leavesLoading, error: leavesError } = useSelector((state) => state.leaves);
  const { data: attendanceData, loading: attendanceLoading, error: attendanceError } = useSelector((state) => state.attendanceSummary);
  const { results, loading: resultsLoading, error: resultsError } = useSelector((state) => state.results);
  const { user, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!user && !authLoading) {
        // Attempt to fetch profile if user is not yet loaded
        const profileAction = await dispatch(fetchProfile()).unwrap();
        if (isMounted && fetchProfile.fulfilled.match(profileAction)) {
          await fetchAllData();
        }
      } else if (user && isMounted) {
        // Fetch data if user is already loaded
        await fetchAllData();
      }
    };

    const fetchAllData = async () => {
      await Promise.all([
        dispatch(fetchStudents()),
        dispatch(fetchTeachers()),
        dispatch(fetchSubjects()),
        dispatch(fetchAllLeaves()),
        dispatch(fetchAttendanceSummary()),
        dispatch(fetchResults()),
      ]);
    };

    fetchData();
    return () => { isMounted = false; };
  }, [dispatch, user, authLoading]);

  const safeLeaves = Array.isArray(leaves) ? leaves : [];
  const summaryData = [
    { name: 'Students', count: students.length },
    { name: 'Teachers', count: teachers.length },
    { name: 'Subjects', count: subjects.length },
    { name: 'Pending Leaves', count: safeLeaves.filter(leave => leave.status === 'Pending').length },
  ];

  const handleRefresh = () => {
    setMessage('Refreshing data...');
    dispatch(fetchProfile()).then((action) => {
      if (fetchProfile.fulfilled.match(action)) {
        Promise.all([
          dispatch(fetchStudents()),
          dispatch(fetchTeachers()),
          dispatch(fetchSubjects()),
          dispatch(fetchAllLeaves()),
          dispatch(fetchAttendanceSummary()),
          dispatch(fetchResults()),
        ]).then(() => {
          setMessage('Data refreshed successfully');
          setTimeout(() => setMessage(''), 2000);
        }).catch(() => {
          setMessage('Failed to refresh some data');
          setTimeout(() => setMessage(''), 5000);
        });
      }
    });
  };

  const isLoading = studentsLoading || teachersLoading || subjectsLoading || leavesLoading || resultsLoading || authLoading;
  const hasError = studentsError || teachersError || subjectsError || leavesError || resultsError || authError;

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

  const passFailData = subjects.map((subject) => {
    const subjectResults = results.filter((r) => r.subject === subject.title);
    const passCount = subjectResults.filter((r) => r.marks >= 40).length;
    const failCount = subjectResults.filter((r) => r.marks < 40).length;
    return {
      title: subject.title,
      pass: passCount,
      fail: failCount,
    };
  });

  const attendanceChartData = [
    {
      name: 'Today',
      present: attendanceData.present || 0,
      absent: attendanceData.absent || 0,
    },
  ];

  return (
    <div className="flex-1 p-6 bg-gray-100">
      <div className="mb-4">
        <p className="text-blue-500">Home / Administrative Dashboard</p>
        <h1 className="text-2xl font-bold">Administrative Dashboard - {user?.name || 'Admin'}</h1>
      </div>

      {message && <p className="mb-4 text-gray-500">{message}</p>}

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
          <p className="text-2xl">{subjects.length}</p>
        </div>
        <div className="bg-red-500 text-white p-4 rounded shadow">
          <p className="text-lg">Pending Leaves</p>
          <p className="text-2xl">{safeLeaves.filter(leave => leave.status === 'Pending').length}</p>
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
          <p className="text-red-500">{studentsError || teachersError || subjectsError || leavesError || resultsError || authError || 'User role not available'}</p>
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
        ) : (
          <BarChart width={600} height={300} data={attendanceChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" fill="#4CAF50" name="Present" />
            <Bar dataKey="absent" fill="#F44336" name="Absent" />
          </BarChart>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Pass/Fail Per Subject</h2>
        {resultsLoading ? (
          <p className="text-gray-500">Loading results data...</p>
        ) : resultsError ? (
          <p className="text-red-500">{resultsError || 'User role not available'}</p>
        ) : results.length > 0 ? (
          <BarChart width={600} height={300} data={passFailData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pass" fill="#4CAF50" name="Pass" />
            <Bar dataKey="fail" fill="#F44336" name="Fail" />
          </BarChart>
        ) : (
          <p className="text-gray-500">No results data available</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;