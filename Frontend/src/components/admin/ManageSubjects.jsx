import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubjects, addSubject, deleteSubject, updateSubject } from '../../redux/subjectSlice';
import { fetchTeachers } from '../../redux/teacherSlice';

function ManageSubjects() {
  const dispatch = useDispatch();
  const { subjects, loading, error } = useSelector((state) => state.subjects);
  const { teachers, loading: teachersLoading, error: teachersError } = useSelector((state) => state.teachers);
  const [subjectData, setSubjectData] = useState({ title: '', teacher: '' });
  const [editData, setEditData] = useState(null); // State to manage edit mode
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(fetchTeachers());
  }, [dispatch]);

  const handleChange = (e) => {
    setSubjectData({ ...subjectData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!subjectData.title.trim() || !subjectData.teacher) {
      setMessage('Please enter a subject title and select a teacher.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    dispatch(addSubject(subjectData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage('Subject added successfully');
        setSubjectData({ title: '', teacher: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        console.error('Add subject failed:', result.payload);
        setMessage(result.payload);
        setTimeout(() => setMessage(''), 5000);
      }
    });
  };

  const handleDeleteSubject = (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      dispatch(deleteSubject(id)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          setMessage('Subject deleted successfully');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage(result.payload);
          setTimeout(() => setMessage(''), 5000);
        }
      });
    }
  };

  const handleEditSubject = (subject) => {
    setEditData({
      _id: subject._id,
      title: subject.title,
      teacher: subject.teacher?._id || '',
    });
  };

  const handleUpdateSubject = (e) => {
    e.preventDefault();
    if (!editData.title.trim() || !editData.teacher) {
      setMessage('Please enter a subject title and select a teacher.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    dispatch(updateSubject({ id: editData._id, title: editData.title, teacher: editData.teacher })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage('Subject updated successfully');
        setEditData(null);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.payload);
        setTimeout(() => setMessage(''), 5000);
      }
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Subjects</h1>
      {message && (
        <p className={`${message.includes('successfully') ? 'text-green-600' : 'text-red-500'} mb-2`}>{message}</p>
      )}
      {(loading || teachersLoading) ? (
        <p className="text-gray-500">Loading...</p>
      ) : error || teachersError ? (
        <p className="text-red-500">{error || teachersError}</p>
      ) : (
        <div>
          <form onSubmit={handleAddSubject} className="mb-6 flex flex-col gap-2">
            <input
              type="text"
              name="title"
              value={subjectData.title}
              onChange={handleChange}
              placeholder="Subject Name"
              className="border p-2 rounded"
              required
            />
            {teachers.length === 0 ? (
              <p className="text-gray-500">No available teachers. Please add more teachers.</p>
            ) : (
              <select
                name="teacher"
                value={subjectData.teacher}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.user?.name || 'N/A'}
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={loading || teachers.length === 0}
            >
              {loading ? 'Adding...' : 'Add Subject'}
            </button>
          </form>
          {subjects.length > 0 && (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Subject Name</th>
                  <th className="border p-2">Teacher Name</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject._id} className="hover:bg-gray-100">
                    <td className="border p-2">{subject.title}</td>
                    <td className="border p-2">{subject.teacher?.user?.name || 'N/A'}</td>
                    <td className="border p-2 flex gap-2">
                      <button
                        onClick={() => handleEditSubject(subject)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
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
          {editData && (
            <div className="mt-6 bg-white p-6 rounded shadow max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Subject</h2>
              <form onSubmit={handleUpdateSubject} className="space-y-4">
                <input
                  type="text"
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                  required
                />
                <select
                  name="teacher"
                  value={editData.teacher}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border p-2 rounded"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.user?.name || 'N/A'}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Update Subject'}
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
        </div>
      )}
    </div>
  );
}

export default ManageSubjects;