import React, { useState, useEffect } from 'react';
import './LikesModal.css';
import axios from 'axios';
import { getUserById } from "../../services/api";

const LikesModal = ({ postId, likedUserIds, currentUserEmail, currentUserName, onClose }) => {
  const [users, setUsers] = useState([]);
  const [userProfileImages, setUserProfileImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const getAvatarColor = (userId) => {
    const colors = ["#2563eb", "#4caf50", "#ff9800", "#e91e63", "#9c27b0"];
    const index = (userId.length > 0) ? userId.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };
  
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


  useEffect(() => {

    const preloadFromCache = () => {
      const storedImages = localStorage.getItem('userProfileImagesCache');
      if (storedImages) {
        try {
          const imageCache = JSON.parse(storedImages);
          console.log("Loaded image cache from localStorage:", imageCache);
          setUserProfileImages(prev => ({...prev, ...imageCache}));
        } catch (e) {
          console.error("Error parsing cached images:", e);
        }
      }
    };
    
    preloadFromCache();
  }, []);


  const forceLoadUserImages = async () => {
    console.log("🔄 Force loading all user profile images");
    
    if (!users || users.length === 0) return;
    
    const imageCache = {};
    const currentLoggedUserId = localStorage.getItem('userId');
    

    if (currentLoggedUserId) {
      try {
        const currentUserImg = localStorage.getItem('userProfileImage');
        if (currentUserImg) {
          console.log("Using cached current user image");
          imageCache[currentLoggedUserId] = currentUserImg;
        } else {
          const response = await getUserById(currentLoggedUserId);
          if (response?.data?.profileImage) {
            imageCache[currentLoggedUserId] = response.data.profileImage;
            console.log("Loaded current user image:", response.data.profileImage);
          }
        }
      } catch (err) {
        console.error("Failed to load current user image:", err);
      }
    }
    

    const promises = users
      .filter(user => user.userId && !imageCache[user.userId])
      .map(async (user) => {
        try {
          console.log(`Loading profile for ${user.name} (${user.userId})`);
          const response = await getUserById(user.userId);
          
          if (response?.data?.profileImage) {
            imageCache[user.userId] = response.data.profileImage;
            console.log(`Got profile image for ${user.name}:`, response.data.profileImage);
            return true;
          }
        } catch (err) {
          console.error(`Failed to load profile for ${user.name}:`, err);
        }
        return false;
      });
      
    await Promise.all(promises);
    

    if (Object.keys(imageCache).length > 0) {
      console.log("Setting all profile images:", imageCache);
      setUserProfileImages(prev => {
        const newState = {...prev, ...imageCache};
        try {
          localStorage.setItem('userProfileImagesCache', JSON.stringify(newState));
        } catch (e) {
          console.error("Error saving image cache:", e);
        }
        return newState;
      });
    }
  };
  

  useEffect(() => {
    if (users.length > 0 && !loading) {
      forceLoadUserImages();
    }
  }, [users, loading]);


  useEffect(() => {
    console.log("Current profile images state:", userProfileImages);
  }, [userProfileImages]);

  const fetchUserProfileImage = async (userId) => {
    if (!userId) return null;
    
    try {
      console.log(`Directly fetching profile image for user ID: ${userId}`);
      const response = await getUserById(userId);
      
      if (response?.data?.profileImage) {
        const imageUrl = response.data.profileImage;
        console.log(`Found profile image for ${userId}:`, imageUrl);
        
        setUserProfileImages(prev => {
          const updated = {...prev, [userId]: imageUrl};
          return updated;
        });
        
        return imageUrl;
      }
    } catch (error) {
      console.error(`Failed to fetch profile for user ${userId}:`, error);
    }
    return null;
  };

  useEffect(() => {
    const fetchAllProfiles = async () => {
      if (!users || users.length === 0) return;
      
      console.log(`Fetching profiles for ${users.length} users...`);
      
      for (const user of users) {
        if (user.userId) {
          await fetchUserProfileImage(user.userId);
        }
      }
    };
    
    if (users.length > 0 && !loading) {
      fetchAllProfiles();
    }
  }, [users, loading]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content likes-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "400px",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          overflow: "hidden"
        }}
      >
        <h3 
          className="likes-modal-title"
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "var(--primary-color)",
            fontSize: "18px",
            fontWeight: "600"
          }}
        >
          People who liked this post
        </h3>
        
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
          <div 
            className="likes-list"
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              padding: "5px 0",
              display: "flex",
              flexDirection: "column",
              gap: "10px" 
            }}
          >
            {users.map((user, index) => {
              const displayName = user.name || (user.email ? user.email.split('@')[0] : `User ${index+1}`);
              const firstLetter = (displayName && displayName.length > 0) ? 
                displayName.charAt(0).toUpperCase() : "?";
              

              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={user.userId || user.email || index} 
                  className="like-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 15px",
                    borderRadius: "10px",
                    margin: "0",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    backgroundColor: isEven ? "var(--background-color-light)" : "var(--background-color-hover)",
                    border: "1px solid var(--border-color-light)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    position: "relative",

                    borderLeft: `4px solid ${user.userId ? getAvatarColor(user.userId) : '#ccc'}`
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  }}
                >
                  <div 
                    className="avatar-container"
                    style={{
                      marginRight: "12px",
                      position: "relative",
                      width: "40px",
                      height: "40px"
                    }}
                  >
                    {user.userId && userProfileImages[user.userId] ? (
                      <img 
                        src={userProfileImages[user.userId]} 
                        alt={displayName}
                        className="user-avatar"
                        style={{ 
                          width: "40px", 
                          height: "40px", 
                          borderRadius: "50%",
                          objectFit: "cover"
                        }}
                        onError={(e) => {
                          console.error(`Failed to load image for ${user.userId}`);
                          e.target.style.display = "none";

                          setTimeout(() => {
                            fetchUserProfileImage(user.userId);
                          }, 1000);
                        }}
                      />
                    ) : (
                      <div 
                        className="user-avatar" 
                        style={{ 
                          backgroundColor: user.userId ? getAvatarColor(user.userId) : '#ccc',
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: "bold"
                        }}
                      >
                        {firstLetter}
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className="user-info"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    {user.userId ? (
                      <a 
                        href={`/profile/${encodeURIComponent(user.userId)}`} 
                        className="comment-user"
                        style={{
                          fontWeight: "600",
                          fontSize: "15px",
                          color: "var(--link-color)",
                          textDecoration: "none"
                        }}
                      >
                        {/* Always show full name if available, else fallback to email username */}
                        {user.name && user.name.trim() && user.name !== user.email.split('@')[0]
                          ? user.name
                          : (user.email ? user.email.split('@')[0] : "Unknown User")}
                      </a>
                    ) : (
                      <div 
                        className="user-name-no-link"
                        style={{
                          fontWeight: "600",
                          fontSize: "15px"
                        }}
                      >
                        {user.name && user.name.trim() && user.name !== user.email.split('@')[0]
                          ? user.name
                          : (user.email ? user.email.split('@')[0] : "Unknown User")}
                      </div>
                    )}
                    <div 
                      className="user-email"
                      style={{
                        fontSize: "12px",
                        color: "var(--text-color-secondary)",
                        marginTop: "3px"
                      }}
                    >
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
