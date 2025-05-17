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
  const [userProfileImage, setUserProfileImage] = useState(null);


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
    const interval = setInterval(fetchUnread, 4000); 
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
        
        if (response.data.profileImage) {
          setUserProfileImage(response.data.profileImage);
          localStorage.setItem('userProfileImage', response.data.profileImage);
        }
      } catch (err) {
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);
        const storedImage = localStorage.getItem('userProfileImage');
        if (storedImage) setUserProfileImage(storedImage);
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
          
          <div className="notification-bell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '18px', position: 'relative', height: 'auto', minHeight: '0', justifyContent: 'center' }}>
            <Link to="/notifications" className="nav-link" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', padding: 0 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}>
                <Bell size={22} style={{ color: unreadCount > 0 ? '#ef4444' : '#6b7280', margin: 0, padding: 0 }} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-7px',
                      right: '-7px',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                      border: '2px solid #fff',
                      padding: '0 4px',
                      zIndex: 2
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: '11px',
                color: '#6b7280',
                marginTop: '0px',
                fontWeight: 500,
                letterSpacing: '0.01em',
                lineHeight: 1.1,
                padding: 0
              }}>
                Notification
              </span>
            </Link>
          </div>
          
          <div className="user-menu-container" ref={userMenuRef}>
            <button onClick={toggleUserMenu} className="avatar-button">
              <div className="navbar-avatar">
                {userProfileImage ? (
                  <img 
                    src={userProfileImage} 
                    alt="Profile" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  <User size={18} strokeWidth={2} />
                )}
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
