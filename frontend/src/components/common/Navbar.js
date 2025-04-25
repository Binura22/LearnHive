import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import axios from 'axios';
import { Bell } from 'lucide-react'; 

const Navbar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // get the logged-in user ID from localStorage
  const userId = localStorage.getItem('userId');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/notifications', {
          withCredentials: true,
        });
        const unread = res.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000); 
    return () => clearInterval(interval);
  }, []);

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
          {/* Dynamic Profile Link */}
          <Link to={userId ? `/profile/${userId}` : "/profile"} className="nav-link">Profile</Link>
          <div className="notification-bell">
            <Link to="/notifications" className="nav-link">
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="notification-count">{unreadCount}</span>
              )}
            </Link>
          </div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
