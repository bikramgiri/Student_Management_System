import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AdminLayout() {
  const { user } = useSelector((state) => state.auth); // Access the authenticated user
  const initial = user && user.email ? user.email.charAt(0).toUpperCase() : 'A';

  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">ADMIN PANEL</h2>
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center mb-4 ml-10 text-xl font-bold text-white">
            {initial}
          </div>
          <h2 className="text-xl font-bold mb-2">Administrator</h2>
        </div>
        <nav className="space-y-2">
          <Link to="/admin/dashboard" className="block bg-blue-600 p-2 rounded">Home</Link>
          <Link to="/admin/profile" className="block p-2 hover:bg-gray-700 rounded">View/Edit Profile</Link>
          <Link to="/admin/notify-teachers" className="block p-2 hover:bg-gray-700 rounded">Notify Teacher</Link>
          <Link to="/admin/notify-students" className="block p-2 hover:bg-gray-700 rounded">Notify Student</Link>
          <Link to="/admin/manage-teachers" className="block p-2 hover:bg-gray-700 rounded">Manage Teachers</Link>
          <Link to="/admin/manage-students" className="block p-2 hover:bg-gray-700 rounded">Manage Students</Link>
          <Link to="/admin/manage-subjects" className="block p-2 hover:bg-gray-700 rounded">Manage Subjects</Link>
          <Link to="/admin/manage-leaves" className="block p-2 hover:bg-gray-700 rounded">Manage Leaves</Link>
        </nav>
      </div>
      <div className="flex-1 p-6 bg-gray-100">
        <Outlet /> {/* Renders the child route component */}
      </div>
    </div>
  );
}

export default AdminLayout;