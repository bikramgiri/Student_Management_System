import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function TeacherLayout() {
  const { user } = useSelector((state) => state.auth);
  const initial = user && user.email ? user.email.charAt(0).toUpperCase() : 'T';

  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">TEACHER PANEL</h2>
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-4 ml-10 text-xl font-bold text-white">
            {initial}
          </div>
          <h2 className="text-xl font-bold mb-2 ml-6">Teacher</h2>
        </div>
        <nav className="space-y-2">
          <Link to="/teacher/dashboard" className="block bg-blue-600 p-2 rounded">Home</Link>
          <Link to="/teacher/profile" className="block p-2 hover:bg-gray-700 rounded">View/Edit Profile</Link>
          <Link to="/teacher/manage-attendance" className="block p-2 hover:bg-gray-700 rounded">Manage Attendance</Link>
          <Link to="/teacher/manage-result" className="block p-2 hover:bg-gray-700 rounded">Manage Result</Link>
          <Link to="/teacher/apply-leave" className="block p-2 hover:bg-gray-700 rounded">Apply For Leave</Link>
        </nav>
      </div>
      <div className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}

export default TeacherLayout;