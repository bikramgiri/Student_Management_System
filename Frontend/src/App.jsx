import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import NotFound from "./pages/NotFound";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// Dashboards
import AdminDashboard from "./components/admin/AdminDashboard";
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import StudentDashboard from "./components/student/StudentDashboard";

// Admin Pages
import ManageStudents from "./components/admin/ManageStudents";
import ManageTeachers from "./components/admin/ManageTeachers";
import ManageCourses from "./components/admin/ManageCourses";
import ManageFeedbacks from './components/admin/ManageFeedbacks';

// import ViewGrades from "./components/student/ViewGrades";
// import ViewCourses from "./components/student/ViewCourses";
// import ViewAssignments from "./components/student/ViewAssignments";
// import ManageAssignments from "./components/teacher/ManageAssignments";
// import ViewAttendance from "./components/student/ViewAttendance";
// import ManageAttendance from "./components/teacher/ManageAttendance";
// import ViewAttendanceReport from "./components/admin/ViewAttendanceReport";
// import ManageAttendanceReport from "./components/admin/ManageAttendanceReport";
// import ViewGradesReport from "./components/admin/ViewGradesReport";
// import ManageGrades from "./components/teacher/ManageGrades";
// import ManageCoursesReport from "./components/admin/ManageCoursesReport";
// import ManageStudentsReport from "./components/admin/ManageStudentsReport";
// import ManageTeachersReport from "./components/admin/ManageTeachersReport";
// import ManageGradesReport from "./components/admin/ManageGradesReport";
// import ManageAssignmentsReport from "./components/admin/ManageAssignmentsReport";

// Protected Route
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-students"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-teachers"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageTeachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-courses"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage-feedbacks"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageFeedbacks />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Teacher"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
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
