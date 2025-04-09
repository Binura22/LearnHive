import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/common/Login';
import MainPage from './components/pages/MainPage';
import AdminDashboard from './components/pages/AdminDashboard';
import AuthCheck from './services/AuthCheck';
import CourseList from './components/pages/CourseList';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/profile" element={<div>Profile Page (Coming Soon)</div>} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/api/auth/check-role" element={<AuthCheck />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;