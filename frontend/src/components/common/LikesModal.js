import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommentModal.css'; 

const LikesModal = ({ postId, likedUserIds = [], currentUserEmail, currentUserName, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processLikes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Raw likes data:", likedUserIds);
        
        if (!likedUserIds || likedUserIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }
        
        const processedUsers = likedUserIds.map(user => {
          if (!user) {
            console.warn("Found null or undefined user in likes data");
            return null;
          }
          
          if (typeof user === 'object' && user.email) {
            return {
              id: user.id || user.email,
              email: user.email,
              name: user.name || user.email.split('@')[0]
            };
          } 
          else if (typeof user === 'string' && user.includes('@')) {
            if (user === currentUserEmail) {
              return {
                id: user,
                email: user,
                name: currentUserName || user.split('@')[0]
              };
            }
            return {
              id: user,
              email: user,
              name: user.split('@')[0]
            };
          } 
          else if (typeof user === 'string') {
            return {
              id: user,
              email: user + "@user.id",
              name: "User " + user.substring(0, 5) 
            };
          }
          
          console.warn("Unhandled user data:", user);
          return null;
        }).filter(Boolean);
        
        console.log("Processed user data:", processedUsers);
        setUsers(processedUsers);
      } catch (error) {
        console.error("Error processing likes:", error);
        setError(`Failed to load user information: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    processLikes();
  }, [likedUserIds, currentUserEmail, currentUserName]);
  
  useEffect(() => {
    if (!postId) return;
    
    const fetchFreshLikes = async () => {
      try {
        console.log("Fetching fresh post data for postId:", postId);
        const response = await axios.get(
          `http://localhost:8080/api/posts/${postId}`, 
          { withCredentials: true }
        );
        
        if (response.data && response.data.likedUserIds) {
          const freshLikedUserIds = response.data.likedUserIds || [];
          console.log("Received fresh liked users data:", freshLikedUserIds);
        }
      } catch (error) {
        console.error("Error fetching fresh likes data:", error);
      }
    };
    
    fetchFreshLikes();
  }, [postId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '400px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, textAlign: 'center' }}>
          People who liked this post
        </h3>
        
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading...</p>
        ) : error ? (
          <div>
            <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
            <button 
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                display: 'block',
                margin: '10px auto'
              }}
            >
              Close
            </button>
          </div>
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No likes yet</p>
        ) : (
          <div className="likes-list">
            {users.map((user, index) => {
              const displayName = user.name || (user.email ? user.email.split('@')[0] : `User ${index+1}`);
              const firstLetter = (displayName && displayName.length > 0) ? 
                displayName.charAt(0).toUpperCase() : "?";
              
              return (
                <div 
                  key={user.id || user.email || index} 
                  className="like-item" 
                  style={{
                    padding: '8px',
                    borderBottom: index < users.length - 1 ? '1px solid #eee' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: user.email === currentUserEmail ? '#f0f8ff' : 'transparent'
                  }}
                >
                  <div 
                    className="user-avatar" 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: user.email === currentUserEmail ? '#4169e1' : '#3b5998',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '10px',
                      fontSize: '14px'
                    }}
                  >
                    {firstLetter}
                  </div>
                  <div className="user-info">
                    <div style={{ fontWeight: 'bold' }}>{displayName}</div>
                    <div style={{ fontSize: '12px', color: '#777' }}>
                      {user.email && user.email.includes('@user.id') ? 'User ID: ' + user.id : user.email}
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
