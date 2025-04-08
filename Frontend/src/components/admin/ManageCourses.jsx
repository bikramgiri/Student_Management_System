import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses, addCourse, deleteCourse } from '../../redux/courseSlice';
import { fetchTeachers } from '../../redux/teacherSlice';

function ManageCourses() {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector((state) => state.courses);
  const { teachers, loading: teachersLoading, error: teachersError } = useSelector((state) => state.teachers);
  const [courseData, setCourseData] = useState({ title: '', description: '', teacher: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchTeachers());
  }, [dispatch]);

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!courseData.title.trim() || !courseData.teacher) {
      setMessage('Please enter a course title and select a teacher.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    dispatch(addCourse(courseData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setMessage('Course added successfully');
        setCourseData({ title: '', description: '', teacher: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        console.error('Add course failed:', result.payload); // Debug log
        setMessage(result.payload);
        setTimeout(() => setMessage(''), 5000);
      }
    });
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      dispatch(deleteCourse(id)).then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          setMessage('Course deleted successfully');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage(result.payload);
          setTimeout(() => setMessage(''), 5000);
        }
      });
    }
  };

  // Filter teachers to only show those not assigned to any course
  const assignedTeacherIds = new Set(courses.map((course) => course.teacher?._id?.toString()));
  const availableTeachers = teachers.filter((teacher) => !assignedTeacherIds.has(teacher._id.toString()));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Courses</h1>
      {message && (
        <p className={`${message.includes('successfully') ? 'text-green-600' : 'text-red-500'} mb-2`}>{message}</p>
      )}
      {(loading || teachersLoading) ? (
        <p className="text-gray-500">Loading...</p>
      ) : error || teachersError ? (
        <p className="text-red-500">{error || teachersError}</p>
      ) : (
        <>
          <form onSubmit={handleAddCourse} className="mb-6 flex flex-col gap-2">
            <input
              type="text"
              name="title"
              value={courseData.title}
              onChange={handleChange}
              placeholder="Course Title"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="description"
              value={courseData.description}
              onChange={handleChange}
              placeholder="Course Description"
              className="border p-2 rounded"
            />
            {availableTeachers.length === 0 ? (
              <p className="text-gray-500">No available teachers. Please add more teachers or free up existing ones.</p>
            ) : (
              <select
                name="teacher"
                value={courseData.teacher}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Teacher</option>
                {availableTeachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.user?.name || 'N/A'} ({teacher.subject})
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={loading || availableTeachers.length === 0}
            >
              {loading ? 'Adding...' : 'Add Course'}
            </button>
          </form>
          {courses.length > 0 && (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Title</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Teacher</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-100">
                    <td className="border p-2">{course.title}</td>
                    <td className="border p-2">{course.description || 'N/A'}</td>
                    <td className="border p-2">
                      {course.teacher?.user?.name || 'N/A'} ({course.teacher?.subject || 'N/A'})
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
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

export default ManageCourses;