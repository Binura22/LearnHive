import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/common/Login';
import MainPage from './components/pages/MainPage';
import AdminDashboard from './components/pages/AdminDashboard';
import AdminCourseList from './components/pages/AdminCourseList';
import EditCourseForm from './components/pages/EditCourseForm';
import AuthCheck from './services/AuthCheck';
import ProtectedRoute from './components/common/ProtectedRoute';
import CourseList from './components/pages/CourseList';
import CourseDetail from './components/pages/CourseDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/profile" element={<div>Profile Page (Coming Soon)</div>} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminCourseList />
          </ProtectedRoute>
        } />
        <Route path="/admin/courses/:courseId/edit" element={
          <ProtectedRoute requiredRole="ADMIN">
            <EditCourseForm />
          </ProtectedRoute>
        } />
        <Route path="/api/auth/check-role" element={<AuthCheck />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;