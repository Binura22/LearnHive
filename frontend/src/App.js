import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import CourseList from './components/CourseList';
import AuthCheck from './components/AuthCheck';
import './styles/components.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/api/auth/check-role" element={<AuthCheck />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/courses" element={<CourseList />} />
      </Routes>
    </Router>
  );
}

export default App;