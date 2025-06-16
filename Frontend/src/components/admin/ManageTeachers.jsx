import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeachers, addTeacher, deleteTeacher, updateTeacher } from '../../redux/teacherSlice';
import { signupUser } from '../../redux/authSlice';

function ManageTeachers() {
  const dispatch = useDispatch();
  const { teachers, loading, error } = useSelector((state) => state.teachers);
  const { user: authUser } = useSelector((state) => state.auth); // Get current user to check admin role
  const [teacherData, setTeacherData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    contactNumber: '',
  });
  const [editData, setEditData] = useState(null); // State to manage edit mode
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchTeachers());
  }, [dispatch]);

  const handleChange = (e) => {
    setTeacherData({ ...teacherData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();
    if (!teacherData.name || !teacherData.email || !teacherData.password || !teacherData.address || !teacherData.contactNumber) {
      setMessage('Name, email, password, address, and contact number are required.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    const userData = {
      name: teacherData.name,
      email: teacherData.email,
      password: teacherData.password,
      role: 'Teacher',
    };
    dispatch(signupUser(userData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        const newTeacherData = {
          user: result.payload.user._id,
          address: teacherData.address,
          contactNumber: teacherData.contactNumber,
        };
        dispatch(addTeacher(newTeacherData)).then((teacherResult) => {
          if (teacherResult.meta.requestStatus === 'fulfilled') {
            dispatch(fetchTeachers()).then(() => {
              setMessage('Teacher added successfully');
              setTeacherData({ name: '', email: '', password: '', address: '', contactNumber: '' });
              setTimeout(() => setMessage(''), 3000);
            });
          } else {
            setMessage(teacherResult.payload || 'Failed to add teacher');
            setTimeout(() => setMessage(''), 5000);
          }
        });
      } else {
        setMessage(result.payload || 'Failed to create user');
        setTimeout(() => setMessage(''), 5000);
      }
    });
  };

  const handleDeleteTeacher = (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      dispatch(deleteTeacher(id)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          setMessage('Teacher deleted successfully');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage(result.payload);
          setTimeout(() => setMessage(''), 5000);
        }
      });
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditData({
      _id: teacher._id,
      userId: teacher.user._id,
      name: teacher.user.name || '',
      email: teacher.user.email || '',
      password: '', // Placeholder, will prompt for new password if needed
      address: teacher.address || '',
      contactNumber: teacher.contactNumber || '',
    });
  };

  const handleUpdateTeacher = (e) => {
    e.preventDefault();
    if (!editData.name || !editData.email || !editData.address || !editData.contactNumber) {
      setMessage('Name, email, address, and contact number are required.');
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
      contactNumber: editData.contactNumber,
    };
    dispatch(updateTeacher(payload)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(fetchTeachers()).then(() => {
          setMessage('Teacher updated successfully');
          setEditData(null);
          setTimeout(() => setMessage(''), 3000);
        });
      } else {
        setMessage(result.payload);
        setTimeout(() => setMessage(''), 5000);
      }
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Teachers</h1>
      {message && (
        <p className={`${message.includes('successfully') ? 'text-green-600' : 'text-red-500'} mb-2`}>
          {message}
        </p>
      )}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <form onSubmit={handleAddTeacher} className="mb-6 flex flex-col gap-2">
            <input
              type="text"
              name="name"
              value={teacherData.name}
              onChange={handleChange}
              placeholder="Name"
              className="border p-2 rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={teacherData.email}
              onChange={handleChange}
              placeholder="Email"
              className="border p-2 rounded"
              required
            />
            <input
              type="password"
              name="password"
              value={teacherData.password}
              onChange={handleChange}
              placeholder="Password"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="address"
              value={teacherData.address}
              onChange={handleChange}
              placeholder="Address"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="contactNumber"
              value={teacherData.contactNumber}
              onChange={handleChange}
              placeholder="Contact Number"
              className="border p-2 rounded"
              required
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Teacher'}
            </button>
          </form>
          {teachers.length > 0 && (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Password</th>
                  <th className="border p-2">Address</th>
                  <th className="border p-2">Contact Number</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-100">
                    <td className="border p-2">{teacher.user?.name || 'N/A'}</td>
                    <td className="border p-2">{teacher.user?.email || 'N/A'}</td>
                    <td className="border p-2">Hidden for security</td>
                    <td className="border p-2">{teacher.address || 'N/A'}</td>
                    <td className="border p-2">{teacher.contactNumber || 'N/A'}</td>
                    <td className="border p-2 flex gap-2">
                      <button
                        onClick={() => handleEditTeacher(teacher)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        disabled={loading || (authUser && authUser.role !== 'Admin')}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher._id)}
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
              <h2 className="text-xl font-semibold mb-4">Edit Teacher</h2>
              <form onSubmit={handleUpdateTeacher} className="space-y-4">
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
                  required
                />
                <input
                  type="text"
                  name="contactNumber"
                  value={editData.contactNumber}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Update Teacher'}
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

export default ManageTeachers;