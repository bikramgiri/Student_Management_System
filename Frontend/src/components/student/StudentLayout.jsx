// src/components/student/StudentLayout.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function StudentLayout() {
  const { user } = useSelector((state) => state.auth);
  const initial = user && user.name ? user.name.charAt(0).toUpperCase() : 'S';

  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6 ml-8">STUDENT PANEL</h2>
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mb-4 mx-auto text-xl font-bold text-white">
            {initial}
          </div>
          <h2 className="text-xl font-bold mb-2 ml-18">Student</h2>
        </div>
        <nav className="space-y-2">
          <Link to="/student/dashboard" className="block bg-blue-600 p-2 rounded">Home</Link>
          <Link to="/student/profile" className="block p-2 hover:bg-gray-700 rounded">View/Edit Profile</Link>
          <Link to="/student/view-attendance" className="block p-2 hover:bg-gray-700 rounded">View Attendance</Link>
          <Link to="/student/view-result" className="block p-2 hover:bg-gray-700 rounded">View Result</Link>
          <Link to="/student/apply-leave" className="block p-2 hover:bg-gray-700 rounded">Apply For Leave</Link>
        </nav>
      </div>
      <div className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}

export default StudentLayout;
