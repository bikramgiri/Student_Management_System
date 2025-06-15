// Login.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from '../../redux/authSlice';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // Add role state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password, role })); // Include role
    if (result.meta.requestStatus === 'fulfilled') {
      const userRole = result.payload.user.role;
      if (userRole === 'Admin') navigate('/admin/dashboard');
      else if (userRole === 'Teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow flex items-center justify-center mt-35">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Login to Your Account</h2>
        
        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full p-2 mb-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
        >
          <option value="">Select Role</option>
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
          <option value="Admin">Admin</option>
        </select>
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;