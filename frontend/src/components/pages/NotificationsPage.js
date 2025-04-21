import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
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
      setNotifications(notifications.filter((n) => n.id !== id));
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
    <div style={{ padding: "20px" }}>
      <h2>Notifications</h2>
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            background: n.read ? "#f2f2f2" : "#fff7cc",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
            <p 
                onClick={() => navigate(`/post/${n.postId}`)} 
                style={{ cursor: "pointer", textDecoration: "underline" }}
            >
                <strong>{n.senderEmail}</strong> {n.message}
            </p>
          <small>{new Date(n.timestamp).toLocaleString()}</small>
          <div style={{ marginTop: "5px" }}>
            {!n.read && (
              <button onClick={() => markAsRead(n.id)} style={{ marginRight: "10px" }}>
                Mark as Read
              </button>
            )}
            <button onClick={() => deleteNotification(n.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationsPage;
