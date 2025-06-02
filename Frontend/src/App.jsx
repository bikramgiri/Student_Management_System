// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import NotFound from "./pages/NotFound";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import AdminDashboard from "./components/admin/AdminDashboard";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import StudentDashboard from "./components/student/StudentDashboard";
import ManageStudents from "./components/admin/ManageStudents";
import ManageTeachers from "./components/admin/ManageTeachers";
import ManageCourses from "./components/admin/ManageCourses";
import ManageFeedbacks from './components/admin/ManageFeedbacks';
import ManageLeaves from './components/admin/ManageLeaves';
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  console.log('App rendered');
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute allowedRoles={["Admin"]}><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin/manage-students"
              element={<ProtectedRoute allowedRoles={["Admin"]}><ManageStudents /></ProtectedRoute>}
            />
            <Route
              path="/admin/manage-teachers"
              element={<ProtectedRoute allowedRoles={["Admin"]}><ManageTeachers /></ProtectedRoute>}
            />
            <Route
              path="/admin/manage-courses"
              element={<ProtectedRoute allowedRoles={["Admin"]}><ManageCourses /></ProtectedRoute>}
            />
            <Route
              path="/admin/manage-feedbacks"
              element={<ProtectedRoute allowedRoles={["Admin"]}><ManageFeedbacks /></ProtectedRoute>}
            />
            <Route
              path="/admin/manage-leaves"
              element={<ProtectedRoute allowedRoles={["Admin"]}><ManageLeaves /></ProtectedRoute>}
            />
            <Route
              path="/teacher/dashboard"
              element={<ProtectedRoute allowedRoles={["Teacher"]}><TeacherDashboard /></ProtectedRoute>}
            />
            <Route
              path="/student/dashboard"
              element={<ProtectedRoute allowedRoles={["Student"]}><StudentDashboard key="student-dashboard" /></ProtectedRoute>}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;