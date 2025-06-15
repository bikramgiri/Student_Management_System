import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, addStudent, deleteStudent, updateStudent } from '../../redux/studentSlice';
import { fetchPotentialStudents } from '../../redux/authSlice';

function ManageStudents() {
  const dispatch = useDispatch();
  const { students, loading, error } = useSelector((state) => state.students);
  const { potentialStudents, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const { user: authUser } = useSelector((state) => state.auth); // Get current user to check admin role
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    enrollmentNumber: '',
    class: '',
    section: '',
  });
  const [editData, setEditData] = useState(null); // State to manage edit mode
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchPotentialStudents());
  }, [dispatch]);

  const handleChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!studentData.name || !studentData.email || !studentData.password || !studentData.enrollmentNumber) {
      setMessage('Name, email, password, and enrollment number are required.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    const userData = {
      name: studentData.name,
      email: studentData.email,
      password: studentData.password,
      role: 'Student',
      address: studentData.address || '',
    };
    const payload = {
      userData,
      enrollmentNumber: studentData.enrollmentNumber,
      class: studentData.class || '',
      section: studentData.section || '',
    };
    console.log('Final payload being sent:', JSON.stringify(payload, null, 2)); // Detailed debug log
    dispatch(fetchPotentialStudents()); // Refresh potential students
    dispatch(addStudent(payload)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(fetchStudents()).then(() => {
          setMessage('Student added successfully');
          setStudentData({ name: '', email: '', password: '', address: '', enrollmentNumber: '', class: '', section: '' });
          setTimeout(() => setMessage(''), 3000);
        });
      } else {
        setMessage(result.payload || 'Failed to add student');
        console.error('Add student failed with payload:', payload, 'Error:', result.payload); // Detailed error log
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

  const handleEditStudent = (student) => {
    setEditData({
      _id: student._id,
      userId: student.user._id,
      name: student.user.name || '',
      email: student.user.email || '',
      password: '', // Placeholder, will prompt for new password if needed
      address: student.user.address || '',
      enrollmentNumber: student.enrollmentNumber,
      class: student.class || '',
      section: student.section || '',
    });
  };

  const handleUpdateStudent = (e) => {
    e.preventDefault();
    if (!editData.name || !editData.email || !editData.enrollmentNumber) {
      setMessage('Name, email, and enrollment number are required.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    const payload = {
      _id: editData._id,
      userId: editData.userId,
      name: editData.name,
      email: editData.email,
      password: editData.password || undefined, // Only send if provided
      address: editData.address,
      enrollmentNumber: editData.enrollmentNumber,
      class: editData.class,
      section: editData.section,
    };
    dispatch(updateStudent(payload)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(fetchStudents()).then(() => {
          setMessage('Student updated successfully');
          setEditData(null);
          setTimeout(() => setMessage(''), 3000);
        });
      } else {
        setMessage(result.payload);
        setTimeout(() => setMessage(''), 5000);
      }
    });
  };

  const enrolledUserIds = new Set(students.map((stu) => stu.user?._id));
  const availableStudents = potentialStudents.filter((user) => !enrolledUserIds.has(user._id));
  console.log('students:', students);
  console.log('potentialStudents:', potentialStudents);
  console.log('enrolledUserIds:', enrolledUserIds);
  console.log('availableStudents:', availableStudents);

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
            <input
              type="text"
              name="name"
              value={studentData.name}
              onChange={handleChange}
              placeholder="Name"
              className="border p-2 rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={studentData.email}
              onChange={handleChange}
              placeholder="Email"
              className="border p-2 rounded"
              required
            />
            <input
              type="password"
              name="password"
              value={studentData.password}
              onChange={handleChange}
              placeholder="Password"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="address"
              value={studentData.address}
              onChange={handleChange}
              placeholder="Address"
              className="border p-2 rounded"
            />
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
              disabled={loading}
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
                  <th className="border p-2">Password</th>
                  <th className="border p-2">Address</th>
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
                    <td className="border p-2">Hidden for security</td>
                    <td className="border p-2">{stu.user?.address || 'N/A'}</td>
                    <td className="border p-2">{stu.enrollmentNumber}</td>
                    <td className="border p-2">{stu.class || 'N/A'}</td>
                    <td className="border p-2">{stu.section || 'N/A'}</td>
                    <td className="border p-2 flex gap-2">
                      <button
                        onClick={() => handleEditStudent(stu)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        disabled={loading || (authUser && authUser.role !== 'Admin')}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(stu._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        disabled={loading || (authUser && authUser.role !== 'Admin')}
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
              <h2 className="text-xl font-semibold mb-4">Edit Student</h2>
              <form onSubmit={handleUpdateStudent} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={editData.password}
                  onChange={handleEditChange}
                  placeholder="Leave blank to keep current password"
                  className="mt-1 block w-full border p-2 rounded"
                />
                <input
                  type="text"
                  name="address"
                  value={editData.address}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                />
                <input
                  type="text"
                  name="enrollmentNumber"
                  value={editData.enrollmentNumber}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="class"
                  value={editData.class}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                />
                <input
                  type="text"
                  name="section"
                  value={editData.section}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Update Student'}
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

export default ManageStudents;