// import React, { useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { logout } from '../../redux/authSlice';
// import { ThemeContext } from '../common/ThemeContext'; // Path should match file structure

// function Navbar() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { token, role } = useSelector((state) => state.auth);
//   const { theme, toggleTheme } = useContext(ThemeContext);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/login');
//   };

//   return (
//     <nav className="bg-gray-800 dark:bg-gray-900 text-white px-4 py-2 flex justify-between items-center">
//       <Link to="/" className="font-bold text-xl">
//         SMS
//       </Link>
//       <div className="flex items-center">
//         {token ? (
//           <>
//             {role === 'Admin' && <Link to="/admin/dashboard" className="mr-4">Admin</Link>}
//             {role === 'Teacher' && <Link to="/teacher/dashboard" className="mr-4">Teacher</Link>}
//             {role === 'Student' && <Link to="/student/dashboard" className="mr-4">Student</Link>}
//             <Link to="/" className="font-bold text-xl px-3 py-1 mr-4">Home</Link>
//             <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded mr-4">
//               Logout
//             </button>
//             <button
//               onClick={toggleTheme}
//               className="p-2 rounded-full bg-gray-700 dark:bg-gray-600"
//               aria-label="Toggle Theme"
//             >
//               {theme === 'light' ? (
//                 <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//               ) : (
//                 <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
//                 </svg>
//               )}
//             </button>
//           </>
//         ) : (
//           <>
//             <Link to="/" className="font-bold text-xl px-3 py-1 mr-4">Home</Link>
//             <Link to="/login" className="font-bold text-xl px-3 py-1 mr-4">Login</Link>
//             <button
//               onClick={toggleTheme}
//               className="p-2 rounded-full bg-gray-700 dark:bg-gray-600"
//               aria-label="Toggle Theme"
//             >
//               {theme === 'light' ? (
//                 <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//               ) : (
//                 <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
//                 </svg>
//               )}
//             </button>
//           </>
//         )}
//       </div>
//     </nav>
//   );
// }

// export default Navbar;





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
            <Link to="/" className="font-bold text-xl px-3 py-1 mr-4">Home</Link>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="font-bold text-xl px-3 py-1 mr-4">Home</Link>
            <Link to="/login" className="font-bold text-xl px-3 py-1 mr-4">Login</Link>
            {/* <Link to="/signup" className="font-bold text-xl px-3 py-1 mr-4">Sign Up</Link> */}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
