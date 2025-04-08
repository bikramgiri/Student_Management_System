import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/authSlice';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, role } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">
        SMS
      </Link>
      <div>
        {token ? (
          <>
            {role === 'Admin' && <Link to="/admin/dashboard" className="mr-4">Admin</Link>}
            {role === 'Teacher' && <Link to="/teacher/dashboard" className="mr-4">Teacher</Link>}
            {role === 'Student' && <Link to="/student/dashboard" className="mr-4">Student</Link>}
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link to="/signup" className="bg-blue-500 px-3 py-1 rounded">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
