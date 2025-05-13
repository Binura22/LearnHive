import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
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

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
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