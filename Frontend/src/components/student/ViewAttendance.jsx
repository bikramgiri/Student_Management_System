import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { fetchAttendanceRecords } from '../../redux/attendanceSlice';

function ViewAttendance() {
  const dispatch = useDispatch();
  const { attendances, loading, error } = useSelector((state) => state.attendance);
  const { user } = useSelector((state) => state.auth);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to current date: 2025-06-22

  useEffect(() => {
    dispatch(fetchAttendanceRecords());
  }, [dispatch]);

  // Filter attendance for the selected date and current student
  const studentAttendance = attendances.filter(att => 
    new Date(att.date).toISOString().split('T')[0] === selectedDate && 
    att.records.some(record => record.student.toString() === user._id)
  );

  // Aggregate bar chart data per subject, ensuring both present and absent are initialized
  const barData = studentAttendance.length > 0 ? Object.values(
    studentAttendance.reduce((acc, att) => {
      att.records.forEach(record => {
        if (record.student.toString() === user._id) {
          const subject = att.subject || 'Unknown';
          console.log(`Subject for record: ${subject}, Status: ${record.status}`); // Enhanced debug log
          if (!acc[subject]) acc[subject] = { subject, present: 0, absent: 0 };
          acc[subject][record.status.toLowerCase()] = (acc[subject][record.status.toLowerCase()] || 0) + 1;
        }
      });
      return acc;
    }, {})
  ) : [];

  // Flatten attendance records for the table
  const tableData = studentAttendance.length > 0 ? studentAttendance.flatMap(att =>
    att.records
      .filter(record => record.student.toString() === user._id)
      .map(record => ({
        date: new Date(att.date).toLocaleDateString(),
        subject: att.subject || 'Unknown',
        status: record.status,
      }))
  ) : [];

  // Check if current date has no attendance
  const isCurrentDate = selectedDate === new Date().toISOString().split('T')[0];
  const hasNoCurrentAttendance = isCurrentDate && studentAttendance.length === 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">View Attendance</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : hasNoCurrentAttendance ? (
        <p className="text-yellow-600">Today attendances are not provided by teachers.</p>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Attendance Summary for {selectedDate}</h2>
            <BarChart width={600} height={300} data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#4CAF50" name="Present" />
              <Bar dataKey="absent" fill="#F44336" name="Absent" />
            </BarChart>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Attendance Details</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2 text-left">Student Name</th>
                  <th className="border p-2 text-left">Subject</th>
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((att, index) => (
                    <tr key={index}>
                      <td className="border p-2">{user.name}</td>
                      <td className="border p-2">{att.subject}</td>
                      <td className="border p-2">{att.date}</td>
                      <td className="border p-2">{att.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="border p-2 text-center">No attendance records for this date.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ViewAttendance;