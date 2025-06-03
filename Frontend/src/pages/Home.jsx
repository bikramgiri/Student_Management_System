import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => { 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  const { user, token } = auth;

  // Restore auth from localStorage if missing
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserString = localStorage.getItem("user");

    let storedUser = null;
    if (storedUserString) {
      try {
        storedUser = JSON.parse(storedUserString);
      } catch (error) {
        console.error("Failed to parse stored user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }

    if (!token && storedToken && storedUser) {
      dispatch({ type: "LOGIN_SUCCESS", payload: { token: storedToken, user: storedUser } });
    }

    setLoading(false);
  }, [token, dispatch]);

  // Handle navigation to dashboard manually
  const handleDashboardRedirect = () => {
    if (user && user.role) {
      if (user.role === "Admin") navigate("/admin/dashboard");
      else if (user.role === "Teacher") navigate("/teacher/dashboard");
      else if (user.role === "Student") navigate("/student/dashboard");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-6 mt-35">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to the Student Management System</h1>
      {user ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Hello, {user.name || user.role}!</h2>
          <p className="text-lg text-gray-600 mb-6">
            You are logged in as a {user.role}. Access your dashboard or explore the system.
          </p>
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600"
            onClick={handleDashboardRedirect}
          >
            Go to {user.role} Dashboard
          </button>
        </div>
      ) : (
        <>
          <p className="text-lg text-gray-600 text-center max-w-2xl mb-6">
            A platform where administrators manage students and teachers, teachers track student progress, and students access their academic records.
          </p>
          <div className="flex space-x-6">
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600"
              onClick={() => navigate("/signup")}
            >
              Signup
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;