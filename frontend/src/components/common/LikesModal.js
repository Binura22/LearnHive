import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommentModal.css'; 

const LikesModal = ({ postId, likedUserIds = [], currentUserEmail, currentUserName, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      
      try {
        console.log("Fetching details for liked users:", likedUserIds);
        
        if (!likedUserIds || likedUserIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }
        
        const processedUsers = likedUserIds.map(userId => {
          if (userId === currentUserEmail) {
            return {
              id: userId,
              email: currentUserEmail,
              name: currentUserName || currentUserEmail.split('@')[0]
            };
          }
          
          return {
            id: userId,
            email: userId,
            name: userId.split('@')[0]
          };
        });
        
        console.log("Processed user data:", processedUsers);
        setUsers(processedUsers);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [likedUserIds, currentUserEmail, currentUserName]);
  
  useEffect(() => {
    if (!postId) return;
    
    const fetchFreshLikes = async () => {
      setLoading(true);
      try {
        console.log("Fetching fresh post data for likes with postId:", postId);
        const response = await axios.get(
          `http://localhost:8080/api/posts/${postId}`, 
          { withCredentials: true }
        );
        
        const freshLikedUserIds = response.data.likedUserIds || [];
        console.log("Received fresh liked users data:", freshLikedUserIds);
        
        const processedUsers = freshLikedUserIds.map(userId => {
          if (userId === currentUserEmail) {
            return {
              id: userId,
              email: currentUserEmail,
              name: currentUserName || currentUserEmail.split('@')[0]
            };
          }
          return {
            id: userId,
            email: userId,
            name: userId.split('@')[0]
          };
        });
        
        setUsers(processedUsers);
      } catch (error) {
        console.error("Error fetching fresh likes data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFreshLikes();
  }, [postId, currentUserEmail, currentUserName]);

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
          <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No likes yet</p>
        ) : (
          <div className="likes-list">
            {users.map((user, index) => {
              const displayName = user.name || user.email?.split('@')[0] || "User";
              const firstLetter = displayName.charAt(0).toUpperCase();
              
              return (
                <div 
                  key={user.id || user.email || index} 
                  className="like-item" 
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid #eee',
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
                    <div style={{ fontSize: '12px', color: '#777' }}>{user.email}</div>
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
