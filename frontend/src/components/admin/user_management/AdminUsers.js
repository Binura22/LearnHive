import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import BackButton from '../common/BackButton';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="admin-users-loading">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="admin-users-error">
        <h2>Error Loading Users</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-users-container">
      <BackButton />
      <h1>User Management</h1>
      
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">{user.name[0]}</div>
              )}
            </div>
            <div className="user-info">
              <h3>{user.name}</h3>
              <p className="user-email">{user.email}</p>
              <p className="user-role">{user.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers; 