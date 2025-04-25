import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommentModal.css'; 

const LikesModal = ({ likedUserIds, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      
      try {
        // display the email addresses
        setUsers(likedUserIds.map(email => ({
          email: email,
          name: email.split('@')[0] // name extraction from email
        })));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("Failed to load who liked this post");
        setLoading(false);
      }
    };

    if (likedUserIds && likedUserIds.length > 0) {
      fetchUserDetails();
    } else {
      setLoading(false);
    }
  }, [likedUserIds]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <h3 style={{ marginTop: 0, textAlign: 'center' }}>
          People who liked this post
        </h3>
        
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No likes yet</p>
        ) : (
          <div className="likes-list">
            {users.map((user, index) => (
              <div 
                key={index} 
                className="like-item" 
                style={{
                  padding: '8px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <div 
                  className="user-avatar" 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#3b5998',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '10px',
                    fontSize: '14px'
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: '#777' }}>{user.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikesModal;
