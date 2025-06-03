import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, addStudent, deleteStudent } from '../../redux/studentSlice';
import { fetchPotentialStudents } from '../../redux/authSlice';

function ManageStudents() {
  const dispatch = useDispatch();
  const { students, loading, error } = useSelector((state) => state.students);
  const { potentialStudents, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const [studentData, setStudentData] = useState({
    user: '',
    enrollmentNumber: '',
    class: '',
    section: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchPotentialStudents());
  }, [dispatch]);

  const handleChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!studentData.user || !studentData.enrollmentNumber.trim()) {
      setMessage('Please select a student and enter an enrollment number.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    dispatch(addStudent(studentData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage('Student added successfully');
        setStudentData({ user: '', enrollmentNumber: '', class: '10th', section: 'A' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.payload);
        setTimeout(() => setMessage(''), 5000);
      }
    });
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      dispatch(deleteStudent(id)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          setMessage('Student deleted successfully');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage(result.payload);
          setTimeout(() => setMessage(''), 5000);
        }
      });
    }
  };

  // Filter out already enrolled students from potentialStudents
  const enrolledUserIds = new Set(students.map((stu) => stu.user?._id));
  const availableStudents = potentialStudents.filter((user) => !enrolledUserIds.has(user._id));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Students</h1>
      {message && (
        <p className={`${message.includes('successfully') ? 'text-green-600' : 'text-red-500'} mb-2`}>{message}</p>
      )}
      {(loading || authLoading) ? (
        <p className="text-gray-500">Loading...</p>
      ) : error || authError ? (
        <p className="text-red-500">{error || authError}</p>
      ) : (
        <>
          <form onSubmit={handleAddStudent} className="mb-6 flex flex-col gap-2">
            <div className="mb-2 text-gray-600 text-sm">
              Note: Different students can share the same enrollment number across different classes.
            </div>
            {availableStudents.length === 0 ? (
              <p className="text-gray-500">
                No available student users. All potential students are enrolled or none exist.
              </p>
            ) : (
              <select
                name="user"
                value={studentData.user}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Student</option>
                {availableStudents.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              name="enrollmentNumber"
              value={studentData.enrollmentNumber}
              onChange={handleChange}
              placeholder="Enrollment Number"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="class"
              value={studentData.class}
              onChange={handleChange}
              placeholder="Class (e.g., 10th)"
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="section"
              value={studentData.section}
              onChange={handleChange}
              placeholder="Section (e.g., A)"
              className="border p-2 rounded"
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={loading || availableStudents.length === 0}
            >
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </form>
          {students.length > 0 && (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Enrollment Number</th>
                  <th className="border p-2">Class</th>
                  <th className="border p-2">Section</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => (
                  <tr key={stu._id} className="hover:bg-gray-100">
                    <td className="border p-2">{stu.user?.name || 'N/A'}</td>
                    <td className="border p-2">{stu.user?.email || 'N/A'}</td>
                    <td className="border p-2">{stu.enrollmentNumber}</td>
                    <td className="border p-2">{stu.class || 'N/A'}</td>
                    <td className="border p-2">{stu.section || 'N/A'}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleDeleteStudent(stu._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:bg-gray-400"
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
        </>
      )}
    </div>
  );
}

export default ManageStudents;