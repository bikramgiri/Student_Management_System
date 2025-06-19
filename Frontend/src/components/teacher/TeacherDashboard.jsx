import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { fetchAttendanceSummary } from '../../redux/attendanceSummarySlice';
import { fetchSubjects } from '../../redux/subjectSlice';
import { fetchStudentsForAttendance } from '../../redux/attendanceSlice';
import { fetchAllLeaves } from '../../redux/leaveSlice';
import { fetchResults } from '../../redux/resultSlice';

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { data: attendanceSummary, loading: attendanceLoading, error: attendanceError } = useSelector((state) => state.attendanceSummary);
  const { subjects, loading: subjectsLoading } = useSelector((state) => state.subjects);
  const { students, loading: studentsLoading } = useSelector((state) => state.attendance);
  const { leaves, loading: leavesLoading } = useSelector((state) => state.leaves);
  const { results, loading: resultsLoading, error: resultsError } = useSelector((state) => state.results);
  const userName = useSelector((state) => state.auth.user?.name || 'Teacher');
  const userRole = useSelector((state) => state.auth.user?.role || 'Computer Science');

  useEffect(() => {
    dispatch(fetchAttendanceSummary());
    dispatch(fetchSubjects());
    dispatch(fetchStudentsForAttendance());
    dispatch(fetchAllLeaves());
    dispatch(fetchResults());
  }, [dispatch]);

  if (attendanceLoading || subjectsLoading || studentsLoading || leavesLoading || resultsLoading) return <p>Loading...</p>;

  const totalStudents = students.length;
  const totalSubjects = subjects.length;
  const totalLeaveApplied = leaves.filter((l) => l.status === 'Pending').length;

  // Custom color array for PieChart
  const COLORS = ['#4CAF50', '#F44336'];

  const pieData = [
    { name: 'Present', value: attendanceSummary.present || 0 },
    { name: 'Absent', value: attendanceSummary.absent || 0 },
  ];

  // Calculate pass/fail counts per subject
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

  const totalAttendanceTaken = (attendanceSummary.present || 0) + (attendanceSummary.absent || 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Teacher Panel - {userName} ({userRole})</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-200 p-4 rounded">
          <h2>Total Students</h2>
          <p className="text-2xl">{totalStudents}</p>
        </div>
        <div className="bg-green-200 p-4 rounded">
          <h2>Total Attendance Taken</h2>
          <p className="text-2xl">{totalAttendanceTaken}</p>
        </div>
        <div className="bg-yellow-200 p-4 rounded">
          <h2>Total Leave Applied</h2>
          <p className="text-2xl">{totalLeaveApplied}</p>
        </div>
        <div className="bg-red-200 p-4 rounded">
          <h2>Total Subjects</h2>
          <p className="text-2xl">{totalSubjects}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3>Attendance Summary</h3>
          <div className="flex justify-between mb-4">
            <div className="bg-green-100 p-2 rounded text-sm">
              Present: {attendanceSummary.present || 0}
            </div>
            <div className="bg-red-100 p-2 rounded text-sm">
              Absent: {attendanceSummary.absent || 0}
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
        <div className="bg-white p-4 rounded shadow">
          <h3>Pass/Fail Per Subject</h3>
          <BarChart width={600} height={300} data={passFailData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" />
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

export default TeacherDashboard;