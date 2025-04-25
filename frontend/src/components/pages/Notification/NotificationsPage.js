import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./NotificationsPage.css";
import SinglePostPage from "./SinglePostPage"; 

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [modalPostId, setModalPostId] = useState(null); 
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="notifications-container">
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
      )}


      {modalPostId && (
        <div
          className="modal-overlay"
          onClick={() => setModalPostId(null)}
        >
          <div
            className="modal-content"
            style={{ maxWidth: 600, width: "95%", maxHeight: "90vh", overflowY: "auto", position: "relative" }}
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
