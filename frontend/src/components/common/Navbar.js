import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import axios from 'axios';
import { Bell, User, LogOut, Moon, Sun, ChevronRight } from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const userMenuRef = useRef(null);
  const themeItemRef = useRef(null);
  const [userName, setUserName] = useState('User');

  // get the logged-in user ID from localStorage
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowThemeOptions(false);
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user/me', { withCredentials: true });
        if (response.data.name) {
          setUserName(response.data.name);
          localStorage.setItem('userName', response.data.name);
        }
      } catch (err) {
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);
      }
    };
    
    fetchUser();
  }, []);

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowThemeOptions(false);
  };

  const handleThemeHover = () => {
    setShowThemeOptions(true);
  };

  const handleThemeLeave = () => {
    setShowThemeOptions(false);
  };

  const setLightMode = () => {
    if (darkMode) toggleDarkMode();
    setShowUserMenu(false);
    setShowThemeOptions(false);
  };

  const setDarkMode = () => {
    if (!darkMode) toggleDarkMode();
    setShowUserMenu(false);
    setShowThemeOptions(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="nav-brand">
          <Link to="/main">
            <img src="/logos/LearnHive_logo_nav.png" alt="LearnHive Logo" />
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/main" className="nav-link">Home</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/learning-plans" className="nav-link">My Learning Plans</Link>
          
          <div className="notification-bell">
            <Link to="/notifications" className="nav-link">
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="notification-count">{unreadCount}</span>
              )}
            </Link>
          </div>
          
          <div className="user-menu-container" ref={userMenuRef}>
            <button onClick={toggleUserMenu} className="avatar-button">
              <div className="navbar-avatar">
                <User size={18} strokeWidth={2} />
              </div>
              <span className="me-text">Me</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <Link to={userId ? `/profile/${userId}` : "/profile"} className="dropdown-item">
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                
                <div 
                  className="dropdown-item theme-item"
                  ref={themeItemRef}
                  onMouseEnter={handleThemeHover}
                  onMouseLeave={handleThemeLeave}
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>Theme</span>
                  <ChevronRight size={14} className="submenu-arrow" />
                  
                  {showThemeOptions && (
                    <div className="theme-dropdown">
                      <button onClick={setLightMode} className={`theme-option ${!darkMode ? 'active' : ''}`}>
                        <Sun size={16} />
                        <span>Light</span>
                      </button>
                      <button onClick={setDarkMode} className={`theme-option ${darkMode ? 'active' : ''}`}>
                        <Moon size={16} />
                        <span>Dark</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <button onClick={handleLogout} className="dropdown-item">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
