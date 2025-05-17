import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./NotificationsPage.css";
import SinglePostPage from "./SinglePostPage"; 
import { ThemeContext } from '../../../contexts/ThemeContext';
import { getModalContentStyle } from '../../../components/common/ModalStyles';
<<<<<<< HEAD
=======
import { Bell, Check, Trash2, AlertCircle, MessageCircle, Heart, UserPlus, Star } from 'lucide-react';
>>>>>>> f48a54fea78213080cf35e0c80bb8c3fb1e76005

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [modalPostId, setModalPostId] = useState(null); 
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
>>>>>>> f48a54fea78213080cf35e0c80bb8c3fb1e76005

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/notifications", {
        withCredentials: true,
      });
      setNotifications(res.data);

      await axios.put("http://localhost:8080/api/notifications/markAsRead", {}, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Error fetching or marking notifications", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/notifications/${id}`);
      setNotifications(prev => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

<<<<<<< HEAD
=======
  const handleDeleteClick = (e, notificationId) => {
    e.stopPropagation();
    setNotificationToDelete(notificationId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete);
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

>>>>>>> f48a54fea78213080cf35e0c80bb8c3fb1e76005
  const markAsRead = async (id) => {
    try {
      await axios.post(
        `http://localhost:8080/api/notifications/${id}/mark-read`
      );
      fetchNotifications();
    } catch (err) {
      console.error("Mark as read failed", err);
    }
  };

<<<<<<< HEAD
=======
  const getNotificationIcon = (message) => {
    if (message.includes("liked")) return <Heart size={20} className="notification-icon like-icon" />;
    if (message.includes("commented")) return <MessageCircle size={20} className="notification-icon comment-icon" />;
    if (message.includes("followed")) return <UserPlus size={20} className="notification-icon follow-icon" />;
    if (message.includes("rated")) return <Star size={20} className="notification-icon star-icon" />;
    return <AlertCircle size={20} className="notification-icon default-icon" />;
  };


  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return notificationTime.toLocaleDateString();
    } else if (diffDays > 0) {
      return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'just now';
    }
  };

>>>>>>> f48a54fea78213080cf35e0c80bb8c3fb1e76005
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="notifications-container">
<<<<<<< HEAD
      <h2 className="notifications-title">Notifications</h2>
      {notifications.length === 0 ? (
        <div className="no-notifications">No notifications yet.</div>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`notification-card${n.read ? " read" : ""}`}
            onClick={() => setModalPostId(n.postId)} 
            style={{ cursor: "pointer" }}
          >
            <div className="notification-message">
              {n.message}
            </div>
            <div className="notification-meta">
              <span className="notification-time">
                {new Date(n.timestamp).toLocaleString()}
              </span>
              <div className="notification-actions">
                {!n.read && (
                  <button
                    className="notification-btn mark-read"
                    onClick={e => { e.stopPropagation(); markAsRead(n.id); }}
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  className="notification-btn delete"
                  onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
=======
      <div className="notifications-header">
        <h2 className="notifications-title">
          <Bell size={24} className="notifications-title-icon" />
          Notifications
        </h2>
        {notifications.length > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={async () => {
              try {
                await axios.put("http://localhost:8080/api/notifications/markAsRead", {}, {
                  withCredentials: true,
                });
                fetchNotifications();
              } catch (err) {
                console.error("Error marking all as read", err);
              }
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <Bell size={48} className="empty-notifications-icon" />
          <p>No notifications yet</p>
          <p className="empty-subtext">When you get notifications, they'll appear here</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-card${n.read ? " read" : ""}`}
              onClick={() => setModalPostId(n.postId)} 
            >
              {!n.read && <div className="unread-indicator"></div>}
              
              <div className="notification-content">
                {getNotificationIcon(n.message)}
                
                <div className="notification-details">
                  <div className="notification-message">
                    {n.message}
                  </div>
                  <div className="notification-time">
                    {formatNotificationTime(n.timestamp)}
                  </div>
                </div>
                
                <div className="notification-actions">
                  {!n.read && (
                    <button
                      className="notification-btn mark-read"
                      title="Mark as read"
                      onClick={e => { e.stopPropagation(); markAsRead(n.id); }}
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    className="notification-btn delete"
                    title="Delete notification"
                    onClick={e => handleDeleteClick(e, n.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div 
            className="modal-content delete-confirmation-modal" 
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '350px',
              padding: '20px',
              textAlign: 'center',
              borderRadius: '10px',
              backgroundColor: 'var(--background-color)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid var(--border-color)'
            }}
          >
            <Trash2 
              size={40} 
              className="delete-icon" 
              style={{ 
                color: 'var(--danger-color, #ff4d4d)',
                marginBottom: '12px',
                opacity: '0.8'
              }} 
            />
            <h3 style={{ margin: '0 0 12px', color: 'var(--text-color-primary)' }}>Delete Notification</h3>
            <p style={{ margin: '0 0 20px', color: 'var(--text-color-secondary)' }}>
              Are you sure you want to delete this notification?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={cancelDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--background-color-light)',
                  color: 'var(--text-color-primary)',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--danger-color, #ff4d4d)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
>>>>>>> f48a54fea78213080cf35e0c80bb8c3fb1e76005
      )}

      {modalPostId && (
        <div
          className="modal-overlay"
          onClick={() => setModalPostId(null)}
        >
          <div
            className="modal-content"
            style={{
              ...getModalContentStyle(darkMode),
              maxWidth: 600,
              width: "95%", 
              maxHeight: "90vh", 
              overflowY: "auto", 
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="close-button"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer"
              }}
              onClick={() => setModalPostId(null)}
            >
              &times;
            </button>
            <SinglePostPage postId={modalPostId} />
          </div>
        </div>
      )}
    </div>
  );
} 

export default NotificationsPage;
