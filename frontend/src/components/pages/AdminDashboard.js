import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const adminFeatures = [
    {
      title: 'Manage Courses',
      description: 'Add, edit, and delete courses',
      icon: '📚',
      path: '/admin/courses'
    },
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: '👥',
      path: '/admin/users'
    },
    {
      title: 'Analytics',
      description: 'View platform usage statistics',
      icon: '📊',
      path: '/admin/analytics'
    },
    {
      title: 'Settings',
      description: 'Configure platform settings',
      icon: '⚙️',
      path: '/admin/settings'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        
        <div className="user-dropdown-container" ref={dropdownRef}>
          <div 
            className="avatar-button" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="me-text">Me</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleLogout} className="logout-button">
                <span className="logout-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="features-grid">
        {adminFeatures.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <Link to={feature.path} className="feature-button">
              Go to {feature.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;