import React, { useState, useEffect } from 'react';
import './LikesModal.css';
import axios from 'axios';

const LikesModal = ({ postId, likedUserIds, currentUserEmail, currentUserName, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchLikedUsers = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/posts/${postId}`, {
          withCredentials: true
        });
        
        if (!response.data || !response.data.likedUserIds) {
          throw new Error("Couldn't fetch post data");
        }
        
        const likedEmails = response.data.likedUserIds.filter(email => email);
        
        const userDetails = [];
        
        for (const email of likedEmails) {
          try {
            console.log("Looking up user ID for email:", email);
            
            const userResponse = await axios.get(
              `http://localhost:8080/api/user/profile?email=${encodeURIComponent(email)}`,
              { withCredentials: true }
            );
            
            if (userResponse.data && userResponse.data.id) {
              userDetails.push({
                name: userResponse.data.name || email.split('@')[0],
                email: email,
                userId: userResponse.data.id  
              });
              console.log("Found user ID:", userResponse.data.id);
            } else {
              console.log("No user ID found in response");
              if (email === currentUserEmail && localStorage.getItem('userId')) {
                userDetails.push({
                  name: localStorage.getItem('userName') || email.split('@')[0],
                  email: email,
                  userId: localStorage.getItem('userId')
                });
              } else {
                userDetails.push({
                  name: email.split('@')[0],
                  email: email,
                  userId: null
                });
              }
            }
          } catch (err) {
            console.error("Error fetching user details for", email, err);
            userDetails.push({
              name: email.split('@')[0],
              email: email,
              userId: null
            });
          }
        }
        
        setUsers(userDetails);
      } catch (err) {
        console.error('Error in fetchLikedUsers:', err);
        setError('Failed to load users who liked this post');
      } finally {
        setLoading(false);
      }
    };

    if (postId && likedUserIds && likedUserIds.length > 0) {
      fetchLikedUsers();
    } else {
      setLoading(false);
    }
  }, [postId, likedUserIds, currentUserEmail]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content likes-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="likes-modal-title">People who liked this post</h3>
        
        {loading ? (
          <p className="likes-modal-loading">Loading...</p>
        ) : error ? (
          <div>
            <p className="likes-modal-error">{error}</p>
            <button onClick={onClose}>Close</button>
          </div>
        ) : users.length === 0 ? (
          <p className="likes-modal-empty">No likes yet</p>
        ) : (
          <div className="likes-list">
            {users.map((user, index) => {
              const displayName = user.name || (user.email ? user.email.split('@')[0] : `User ${index+1}`);
              const firstLetter = (displayName && displayName.length > 0) ? 
                displayName.charAt(0).toUpperCase() : "?";
              
              return (
                <div 
                  key={user.userId || user.email || index} 
                  className="like-item"
                >
                  {user.userId ? (
                    <a 
                      href={`/profile/${encodeURIComponent(user.userId)}`} 
                      className="user-avatar"
                    >
                      {firstLetter}
                    </a>
                  ) : (
                    <div className="user-avatar">
                      {firstLetter}
                    </div>
                  )}
                  
                  <div className="user-info">
                    {user.userId ? (
                      <a 
                        href={`/profile/${encodeURIComponent(user.userId)}`} 
                        className="comment-user"
                      >
                        {displayName}
                      </a>
                    ) : (
                      <div className="user-name-no-link">
                        {displayName}
                      </div>
                    )}
                    <div className="user-email">
                      {user.email}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikesModal;
