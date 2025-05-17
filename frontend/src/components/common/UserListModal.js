import React from "react";
import { useNavigate } from "react-router-dom";
import "./UserListModal.css";

const UserListModal = ({ title, users, onClose }) => {
  const navigate = useNavigate();

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {users.length === 0 ? (
          <p>No users to show.</p>
        ) : (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id} onClick={() => handleUserClick(user.id)}>
                <img
                  src={user.profileImage || "/default-profile.png"}
                  alt={user.name}
                  className="user-avatar"
                />
                <span>{user.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserListModal;
