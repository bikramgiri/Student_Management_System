// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import NotFound from "./pages/NotFound";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import AdminLayout from './components/admin/AdminLayout';
import TeacherLayout from './components/teacher/TeacherLayout';
import ManageAttendance from "./components/teacher/ManageAttendance";
import ManageResult from "./components/teacher/ManageResult";
import ApplyForLeave from "./components/teacher/ApplyForLeave";
import AdminDashboard from "./components/admin/AdminDashboard";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import StudentDashboard from "./components/student/StudentDashboard";
import ManageStudents from "./components/admin/ManageStudents";
import ManageTeachers from "./components/admin/ManageTeachers";
import ManageSubjects from "./components/admin/ManageSubjects";
import ManageLeaves from './components/admin/ManageLeaves';
import ProtectedRoute from "./components/common/ProtectedRoute";
import ViewEditProfile from './components/admin/ViewEditProfile';
import { useDispatch } from 'react-redux';
import { fetchProfile } from './redux/authSlice';

function App() {
  console.log('App rendered');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);
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
              path="/admin"
              element={<ProtectedRoute allowedRoles={["Admin"]}><AdminLayout /></ProtectedRoute>}
            >
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute allowedRoles={["Admin"]}><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin/profile"
              element={<ProtectedRoute allowedRoles={["Admin"]}><ViewEditProfile /></ProtectedRoute>}
            />
            {/* <Route
              path="/admin/notify-teachers"
              element={<ProtectedRoute allowedRoles={["Admin"]}><NotifyTeachers /></ProtectedRoute>}
            />
            <Route
              path="/admin/notify-students"
              element={<ProtectedRoute allowedRoles={["Admin"]}><NotifyStudents /></ProtectedRoute>}
            /> */}
            <Route
              path="/admin/manage-students"
              element={<ProtectedRoute allowedRoles={["Admin"]}><ManageStudents /></ProtectedRoute>}
            />
            <Route
              path="/admin/manage-teachers"
              element={<ProtectedRoute allowedRoles={["Admin"]}><ManageTeachers /></ProtectedRoute>}
            />
            <Route
              path="/admin/manage-subjects"
              element={<ProtectedRoute allowedRoles={["Admin"]}><ManageSubjects /></ProtectedRoute>}
            />
            {/* <Route
              path="/admin/manage-feedbacks"
              element={<ProtectedRoute allowedRoles={["Admin"]}><ManageFeedbacks /></ProtectedRoute>}
            /> */}
            <Route
              path="/admin/manage-leaves"
              element={<ProtectedRoute allowedRoles={["Admin"]}><ManageLeaves /></ProtectedRoute>}
            />
            </Route>
            {/* <Route
              path="/teacher/dashboard"
              element={<ProtectedRoute allowedRoles={["Teacher"]}><TeacherDashboard /></ProtectedRoute>}
            /> */}
            <Route
              path="/teacher"
              element={<ProtectedRoute allowedRoles={["Teacher"]}><TeacherLayout /></ProtectedRoute>}
            >
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/profile" element={<ViewEditProfile />} />
              <Route path="/teacher/manage-attendance" element={<ManageAttendance />} />
              <Route path="/teacher/manage-result" element={<ManageResult />} />
              <Route path="/teacher/apply-leave" element={<ApplyForLeave />} />
            </Route>
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