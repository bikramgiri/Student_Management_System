// E:/Student Management System(SMS)/Frontend/src/components/Signup.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!userData.name || userData.name.length < 2) {
      dispatch({ type: 'auth/signupUser/rejected', payload: 'Name must be at least 2 characters long' });
      return;
    }
    if (!userData.email || !/^\S+@\S+\.\S+$/.test(userData.email)) {
      dispatch({ type: 'auth/signupUser/rejected', payload: 'Please provide a valid email address' });
      return;
    }
    if (!userData.password || userData.password.length < 6) {
      dispatch({ type: 'auth/signupUser/rejected', payload: 'Password must be at least 6 characters long' });
      return;
    }
    if (!['admin','Teacher', 'Student'].includes(userData.role)) {   
      dispatch({ type: 'auth/signupUser/rejected', payload: 'Invalid role selected' });
      return;
    }

    const result = await dispatch(signupUser(userData));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/'); // Auto-login redirects via Home.jsx
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSignup}>
        <div className="mb-4">
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className="w-full border px-2 py-1"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            className="w-full border px-2 py-1"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            className="w-full border px-2 py-1"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium">Role</label>
          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          >
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            {/* <option value="Admin">Admin</option> */}
          </select>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default Signup;