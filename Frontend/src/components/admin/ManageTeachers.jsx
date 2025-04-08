import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeachers, addTeacher, deleteTeacher } from '../../redux/teacherSlice';
import { fetchPotentialTeachers } from '../../redux/authSlice';

function ManageTeachers() {
  const dispatch = useDispatch();
  const { teachers, loading, error } = useSelector((state) => state.teachers);
  const { potentialTeachers, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const [teacherData, setTeacherData] = useState({
    user: '',
    subject: '',
    qualification: '',
    experience: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchTeachers());
    dispatch(fetchPotentialTeachers());
  }, [dispatch]);

  const handleChange = (e) => {
    setTeacherData({ ...teacherData, [e.target.name]: e.target.value });
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();
    if (!teacherData.user || !teacherData.subject.trim()) {
      setMessage('Please select a teacher and enter a subject.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    const payload = {
      user: teacherData.user,
      subject: teacherData.subject,
      qualification: teacherData.qualification,
    };
    if (teacherData.experience) {
      const exp = Number(teacherData.experience);
      if (isNaN(exp) || exp < 0) {
        setMessage('Experience must be a non-negative number');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      payload.experience = exp;
    }
    dispatch(addTeacher(payload)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage('Teacher added successfully');
        setTeacherData({ user: '', subject: '', qualification: '', experience: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.payload);
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

  // Filter out already assigned teachers from potentialTeachers
  const assignedTeacherIds = new Set(teachers.map((teacher) => teacher.user?._id));
  const availableTeachers = potentialTeachers.filter((user) => !assignedTeacherIds.has(user._id));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Teachers</h1>
      {message && (
        <p className={`${message.includes('successfully') ? 'text-green-600' : 'text-red-500'} mb-2`}>
          {message}
        </p>
      )}
      {(loading || authLoading) ? (
        <p className="text-gray-500">Loading...</p>
      ) : error || authError ? (
        <p className="text-red-500">{error || authError}</p>
      ) : (
        <>
          <form onSubmit={handleAddTeacher} className="mb-6 flex flex-col gap-2">
            {availableTeachers.length === 0 ? (
              <p className="text-gray-500">
                No available teacher users. All potential teachers are assigned or none exist.
              </p>
            ) : (
              <select
                name="user"
                value={teacherData.user}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Teacher</option>
                {availableTeachers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              name="subject"
              value={teacherData.subject}
              onChange={handleChange}
              placeholder="Subject"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="qualification"
              value={teacherData.qualification}
              onChange={handleChange}
              placeholder="Qualification"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="experience"
              value={teacherData.experience}
              onChange={handleChange}
              placeholder="Experience (years)"
              className="border p-2 rounded"
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={loading || availableTeachers.length === 0}
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
                  <th className="border p-2">Subject</th>
                  <th className="border p-2">Qualification</th>
                  <th className="border p-2">Experience</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-100">
                    <td className="border p-2">{teacher.user?.name || 'N/A'}</td>
                    <td className="border p-2">{teacher.user?.email || 'N/A'}</td>
                    <td className="border p-2">{teacher.subject}</td>
                    <td className="border p-2">{teacher.qualification || 'N/A'}</td>
                    <td className="border p-2">{teacher.experience || 'N/A'}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleDeleteTeacher(teacher._id)}
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

export default ManageTeachers;