import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fetchAttendanceRecords } from '../../redux/attendanceSlice';
import { fetchResults } from '../../redux/resultSlice';
import { fetchAllLeaves } from '../../redux/leaveSlice';

function StudentDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { attendances, loading: attendanceLoading, error: attendanceError } = useSelector((state) => state.attendance);
  const { results, loading: resultsLoading, error: resultsError } = useSelector((state) => state.results);
  const { leaves, loading: leavesLoading, error: leavesError } = useSelector((state) => state.leaves);

  useEffect(() => {
    dispatch(fetchAttendanceRecords());
    dispatch(fetchResults());
    dispatch(fetchAllLeaves());
  }, [dispatch]);

  const currentDate = new Date().toISOString().split('T')[0]; // Current date: 2025-06-22
  const todayAttendance = attendances.filter(att => 
    new Date(att.date).toISOString().split('T')[0] === currentDate
  );

  // Aggregate attendance status for the current student
  const studentTodayAttendance = todayAttendance.reduce((acc, att) => {
    const studentRecords = att.records.filter(record => record.student.toString() === user._id);
    studentRecords.forEach(record => {
      acc[record.status] = (acc[record.status] || 0) + 1;
    });
    return acc;
  }, { Present: 0, Absent: 0 });

  const pieData = [
    { name: 'Present', value: studentTodayAttendance.Present },
    { name: 'Absent', value: studentTodayAttendance.Absent },
  ];

  const passFailData = results.map(result => ({
    subject: result.subject,
    pass: result.marks >= 40 ? 1 : 0,
    fail: result.marks < 40 ? 1 : 0,
  }));

  const COLORS = ['#4CAF50', '#F44336'];

  // Calculate metrics
  const totalSubjects = new Set(results.map(result => result.subject)).size;
  const totalLeaveApplied = leaves ? leaves.filter(leave => leave.student === user._id).length : 0;
  const totalAttendanceRecords = attendances.length;
  const totalPresent = attendances.reduce((sum, att) => sum + att.records.filter(r => r.student.toString() === user._id && r.status === 'Present').length, 0);
  const percentagePresent = totalAttendanceRecords > 0 ? ((totalPresent / totalAttendanceRecords) * 100).toFixed(2) : 0;
  const percentageAbsent = totalAttendanceRecords > 0 ? (100 - percentagePresent).toFixed(2) : 0;

  if (attendanceLoading || resultsLoading || leavesLoading) return <p>Loading...</p>;
  if (attendanceError || resultsError || leavesError) return <p>Error: {attendanceError || resultsError || leavesError}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard - {user.name}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Subjects */}
        <div className="bg-teal-500 text-white p-4 rounded shadow">
          <p className="text-lg">Total Subjects</p>
          <p className="text-2xl font-bold">{totalSubjects}</p>
        </div>
        {/* Total Leave Applied */}
        <div className="bg-green-500 text-white p-4 rounded shadow">
          <p className="text-lg">Total Leave Applied</p>
          <p className="text-2xl font-bold">{totalLeaveApplied}</p>
        </div>
        {/* Percentage Present */}
        <div className="bg-yellow-500 text-white p-4 rounded shadow">
          <p className="text-lg">Percentage Present</p>
          <p className="text-2xl font-bold">{percentagePresent}%</p>
        </div>
        {/* Percentage Absent */}
        <div className="bg-red-500 text-white p-4 rounded shadow">
          <p className="text-lg">Percentage Absent</p>
          <p className="text-2xl font-bold">{percentageAbsent}%</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Summary (Today)</h3>
          <div className="flex justify-between mb-4">
            <div className="bg-green-100 p-2 rounded text-sm">
              Present: {studentTodayAttendance.Present || 0}
            </div>
            <div className="bg-red-100 p-2 rounded text-sm">
              Absent: {studentTodayAttendance.Absent || 0}
            </div>
          </div>
          <PieChart width={400} height={400}>
            <Pie
              data={pieData}
              cx={200}
              cy={200}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          {attendanceError && <p className="text-red-500 mt-2">Error: {attendanceError}</p>}
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pass/Fail Summary</h3>
          <BarChart width={500} height={300} data={passFailData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pass" fill="#4CAF50" name="Pass" />
            <Bar dataKey="fail" fill="#F44336" name="Fail" />
          </BarChart>
          {resultsError && <p className="text-red-500 mt-2">Error: {resultsError}</p>}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;