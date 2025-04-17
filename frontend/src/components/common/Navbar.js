import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="nav-brand">
          <Link to="/main">
            <img src="/logos/LearnHive_logo-white.png" alt="LearnHive Logo" />
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/main" className="nav-link">Home</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 