import React, { useState, useEffect } from "react";
import axios from "axios";
import './CommentModal.css';
import { getUserById } from "../../services/api";

const CommentModal = ({ 
  postId, 
  onClose, 
  userEmail, 
  postOwnerEmail, 
  postOwnerName,
  onCommentAdded,
  onCommentDeleted
}) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState(userEmail || "");
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null);
  const [isPostOwner, setIsPostOwner] = useState(false);
  const loggedUserId = localStorage.getItem("userId");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isReply, setIsReply] = useState(false);
  const [userProfileImages, setUserProfileImages] = useState({});
  

  const fetchCurrentUserProfile = async (userId) => {
    console.log("Specifically fetching profile for current user ID:", userId);
    if (!userId) {
      console.log("No user ID provided to fetchCurrentUserProfile");
      return;
    }
    
    try {
      const response = await getUserById(userId);
      console.log("Current user profile response:", response);
      
      if (response?.data?.profileImage) {
        const imgUrl = response.data.profileImage;
        console.log("Setting current user profile image:", imgUrl);
        setCurrentUserProfileImage(imgUrl);
        localStorage.setItem('userProfileImage', imgUrl);
        
        setUserProfileImages(prev => ({
          ...prev,
          [userId]: imgUrl
        }));
        return imgUrl;
      } else {
        console.log(" No profile image in response for current user");
      }
    } catch (error) {
      console.error(" Error fetching current user profile:", error);
    }
    return null;
  };


  useEffect(() => {
    const currentUserId = localStorage.getItem('userId');
    if (currentUserId) {
      fetchCurrentUserProfile(currentUserId);
    }
  }, []);
  
  useEffect(() => {
    if (loggedUserId) {
      fetchCurrentUserProfile(loggedUserId);
    }
  }, [loggedUserId]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch current user data
        const response = await axios.get('http://localhost:8080/api/user/me', { withCredentials: true });
        const userId = response.data.id;
        const email = response.data.email;
        console.log("API returned user data:", response.data);
        
        if (email) {
          setCurrentUserEmail(email);
          localStorage.setItem('userEmail', email);
        }
        
        const name = response.data.name;
        if (name) {
          setCurrentUserName(name);
          localStorage.setItem('userName', name);
        }
        

        if (userId) {
          localStorage.setItem('userId', userId);
          
          try {
            console.log("Attempting to fetch user profile image directly...");
            const profileResponse = await getUserById(userId);
            console.log("Profile response:", profileResponse);
            
            if (profileResponse.data && profileResponse.data.profileImage) {
              const imageUrl = profileResponse.data.profileImage;
              console.log("Setting profile image from API:", imageUrl);
              setCurrentUserProfileImage(imageUrl);
              localStorage.setItem('userProfileImage', imageUrl);
              
              setUserProfileImages(prev => ({
                ...prev,
                [userId]: imageUrl
              }));
            }
          } catch (profileError) {
            console.error("Error fetching profile details:", profileError);
            
            const storedImage = localStorage.getItem('userProfileImage');
            if (storedImage) {
              console.log("Using profile image from localStorage:", storedImage);
              setCurrentUserProfileImage(storedImage);
              setUserProfileImages(prev => ({ ...prev, [userId]: storedImage }));
            }
          }
        }
      } catch (err) {
        console.error("Error in fetchUserData:", err);
        
        const storedUserId = localStorage.getItem('userId');
        const storedEmail = localStorage.getItem('userEmail');
        const storedName = localStorage.getItem('userName');
        const storedImage = localStorage.getItem('userProfileImage');
        
        if (storedEmail) setCurrentUserEmail(storedEmail);
        if (storedName) setCurrentUserName(storedName);
        
        if (storedImage) {
          console.log("Setting profile image from localStorage fallback:", storedImage);
          setCurrentUserProfileImage(storedImage);
          
          if (storedUserId) {
            setUserProfileImages(prev => ({ ...prev, [storedUserId]: storedImage }));
          }
        }
      }
    };

    fetchUserData();
    fetchComments();
  }, [postId]);

  const fetchComments = () => {
    setIsLoading(true);
    axios.get(`http://localhost:8080/api/posts/${postId}`, { withCredentials: true })
      .then((res) => {
        const post = res.data;
        setComments(post.comments || []);
      })
      .catch(() => setError("Failed to load comments"))
      .finally(() => setIsLoading(false));
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    

    setError(null);
    
    try {
      let commentAddedSuccessfully = false;
      
      const response = await axios.post(
        `http://localhost:8080/api/posts/${postId}/comment`,
        { text: commentText },
        { withCredentials: true }
      );
      
      commentAddedSuccessfully = true;
      console.log("Comment added successfully:", response.data);
      
      if (commentAddedSuccessfully) {
        fetchComments();
        setCommentText("");
        
        if (typeof onCommentAdded === 'function') {
          onCommentAdded();
        }
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment. Please try again.");
    }
  };
  console.log("Comments", comments)
  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await axios.post(
        `http://localhost:8080/api/posts/${postId}/comment/${commentId}/reply`,
        { text: replyText },
        { withCredentials: true }
      );
      fetchComments();
      setReplyingTo(null);
      setReplyText("");
    } catch {
      setError("Failed to reply. Please try again.");
    }
    setReplyLoading(false);
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };

  const submitEditComment = async () => {
    if (!editText.trim()) return;
    setEditLoading(true);
    
    try {
      await axios.put(
        `http://localhost:8080/api/posts/${postId}/comment/${editingCommentId}`,
        { text: editText },
        { withCredentials: true }
      );
      fetchComments();
      setEditingCommentId(null);
      setEditText("");
    } catch (err) {
      console.error("Error updating comment:", err);
      setError("Failed to update comment. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleReplyClick = (commentId) => {
    console.log("Reply clicked for comment ID:", commentId);
    setEditingCommentId(null);
    setReplyingTo(commentId);
  };

  const handleDeleteComment = async (commentId) => {
    setCommentToDelete(commentId);
    setIsReply(false);
    setShowDeleteModal(true);
  };

  const handleDeleteReply = async (replyId) => {
    setCommentToDelete(replyId);
    setIsReply(true);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/posts/${postId}/comment/${commentToDelete}`,
        { withCredentials: true }
      );
      fetchComments();
      setError(null);
      
      if (typeof onCommentDeleted === 'function') {
        onCommentDeleted();
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      if (err.response && err.response.status === 403) {
        setError("You can only delete your own comments");
      } else {
        setError("Failed to delete comment. Please try again.");
      }
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setCommentToDelete(null);
    }
  };

  useEffect(() => {
    console.log("Current replyingTo state:", replyingTo);
  }, [replyingTo]);

  const getAvatarColor = (userId) => {
    const colors = ["#2563eb", "#4caf50", "#ff9800", "#e91e63", "#9c27b0"];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const commentDate = new Date(timestamp);
    const now = new Date();
    
    const diff = now - commentDate;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) {
      return commentDate.toLocaleDateString();
    } else if (days > 0) {
      return days === 1 ? 'yesterday' : `${days} days ago`;
    } else if (hours > 0) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (minutes > 0) {
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else {
      return 'just now';
    }
  };

  const renderReplies = (replies) => {
    console.log("Replies:", replies);
    
    return (
      <div className="single-post-replies">
        {replies.map((reply, idx) => {
          console.log("Individual reply:", reply);
          
          let displayName = "Unknown User";
          if (reply.userName) {
            displayName = reply.userName;
          } else if (reply.name) {
            displayName = reply.name;
          } else if (reply.userId) {
            if (reply.userId.includes('@')) {
              displayName = reply.userId.split('@')[0];
            } else if (reply.userId.length > 20) {
              displayName = `User ${reply.userId.substring(0, 5)}...`;
            } else {
              displayName = reply.userId;
            }
          }
          
          const firstLetter = displayName.charAt(0).toUpperCase();
          
          return (
            <div key={reply.id || idx} className="single-post-reply">
              {userProfileImages[reply.userId] ? (
                <img 
                  src={userProfileImages[reply.userId]} 
                  alt={reply.userName}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar">
                  {firstLetter}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div className="reply-header" style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div className="reply-info" style={{ display: 'flex', alignItems: 'center' }}>
                    <a 
                      href={`/profile/${encodeURIComponent(reply.userId)}`} 
                      className="comment-user"
                      style={{ marginRight: '8px' }}
                    >
                      {reply.userName || (reply.userId ? (
                        reply.userId.includes('@') 
                          ? reply.userId.split('@')[0] 
                          : (reply.userId.length > 20 
                            ? `User ${reply.userId.substring(0, 5)}...` 
                            : reply.userId)
                      ) : "Unknown User")}
                    </a>
                    <span className="comment-time">{formatTimestamp(reply.timestamp)}</span>
                  </div>
                  
                  {reply.userId === loggedUserId && (
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      disabled={deleteLoading}
                      className="delete-btn"
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: "#ff4d4d", 
                        fontSize: "12px", 
                        cursor: "pointer",
                        padding: "0 8px"
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="comment-text">{reply.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (comments.length > 0) {
      console.log("Comments with replies:", comments);
    }
  }, [comments]);

  useEffect(() => {
    const fetchProfileImages = async () => {
      const profiles = { ...userProfileImages };
      
      for (const comment of comments) {
        if (comment.userId && !profiles[comment.userId]) {
          try {
            const response = await getUserById(comment.userId);
            if (response.data && response.data.profileImage) {
              profiles[comment.userId] = response.data.profileImage;
            }
          } catch (error) {
            console.error(`Failed to fetch profile for user ${comment.userId}:`, error);
          }
        }
        

        if (comment.replies) {
          for (const reply of comment.replies) {
            if (reply.userId && !profiles[reply.userId]) {
              try {
                const response = await getUserById(reply.userId);
                if (response.data && response.data.profileImage) {
                  profiles[reply.userId] = response.data.profileImage;
                }
              } catch (error) {
                console.error(`Failed to fetch profile for user ${reply.userId}:`, error);
              }
            }
          }
        }
      }
      
      setUserProfileImages(profiles);
    };
    
    if (comments.length > 0) {
      fetchProfileImages();
    }
  }, [comments]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="comment-list">
          {isLoading ? (
            <p>Loading comments...</p>
          ) : comments.length > 0 ? (
            comments.map((c, index) => (
              <div key={c.id || index} className="comment-item">
                {userProfileImages[c.userId] ? (
                  <img 
                    src={userProfileImages[c.userId]} 
                    alt={c.userName}
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar">
                    {c.userName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div className="comment-header">
                    <div className="comment-user-info">
                      <a href={`/profile/${encodeURIComponent(c.userId)}`} className="comment-user">
                        {c.userName}
                      </a>
                      <span className="comment-time">{formatTimestamp(c.timestamp)}</span>
                    </div>
                    <div className="comment-actions">
                      {c.userId === loggedUserId && (
                        <>
                          <button 
                            className="edit-btn" 
                            onClick={() => handleEditComment(c)}
                            style={{ 
                              background: "none", 
                              border: "none", 
                              color: "#4f46e5", 
                              fontSize: "12px", 
                              cursor: "pointer", 
                              marginRight: "8px" 
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn" 
                            onClick={() => handleDeleteComment(c.id)}
                            style={{ 
                              background: "none", 
                              border: "none", 
                              color: "#ff4d4d", 
                              fontSize: "12px", 
                              cursor: "pointer" 
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {editingCommentId === c.id ? (
                    <div className="edit-comment-form">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="edit-textarea"
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ddd",
                          marginTop: "8px",
                          marginBottom: "8px"
                        }}
                      />
                      <div className="edit-actions" style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={submitEditComment}
                          disabled={editLoading}
                          className="save-btn"
                          style={{
                            background: "#4f46e5",
                            color: "white",
                            border: "none",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          {editLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="cancel-btn"
                          style={{
                            background: "#f3f4f6",
                            color: "#374151",
                            border: "1px solid #d1d5db",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="comment-text">{c.text}</div>
                      <span 
                        className="single-post-reply-btn" 
                        onClick={() => handleReplyClick(c.id)}
                        style={{ cursor: 'pointer', display: 'inline-block', marginTop: '8px' }}
                      >
                        Reply
                      </span>
                    </>
                  )}
                  
                  {replyingTo === c.id && !editingCommentId && (
                    <div className="single-post-reply-form">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        style={{ width: '100%', marginTop: '8px', padding: '8px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => handleReplySubmit(c.id)}
                          disabled={replyLoading}
                          style={{ 
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '5px 10px'
                          }}
                        >
                          {replyLoading ? "Sending..." : "Reply"}
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setReplyingTo(null)}
                          style={{ 
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            padding: '5px 10px'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {c.replies && c.replies.length > 0 && (
                    <div className="single-post-replies">
                      {c.replies.map((reply, idx) => (
                        <div key={reply.id || idx} className="single-post-reply">
                          {userProfileImages[reply.userId] ? (
                            <img 
                              src={userProfileImages[reply.userId]} 
                              alt={reply.userName}
                              className="user-avatar"
                            />
                          ) : (
                            <div className="user-avatar">
                              {reply.userName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div className="reply-header" style={{ 
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div className="reply-info" style={{ display: 'flex', alignItems: 'center' }}>
                                <a 
                                  href={`/profile/${encodeURIComponent(reply.userId)}`} 
                                  className="comment-user"
                                  style={{ marginRight: '8px' }}
                                >
                                  {reply.userName || (reply.userId ? (
                                    reply.userId.includes('@') 
                                      ? reply.userId.split('@')[0] 
                                      : (reply.userId.length > 20 
                                        ? `User ${reply.userId.substring(0, 5)}...` 
                                        : reply.userId)
                                  ) : "Unknown User")}
                                </a>
                                <span className="comment-time">{formatTimestamp(reply.timestamp)}</span>
                              </div>
                              
                              {reply.userId === loggedUserId && (
                                <button
                                  onClick={() => handleDeleteReply(reply.id)}
                                  disabled={deleteLoading}
                                  className="delete-btn"
                                  style={{ 
                                    background: "none", 
                                    border: "none", 
                                    color: "#ff4d4d", 
                                    fontSize: "12px", 
                                    cursor: "pointer",
                                    padding: "0 8px"
                                  }}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <div className="comment-text">{reply.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet</p>
          )}
        </div>
        {error && <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
        <div className="comment-form">
          <div className="comment-input-area" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            {loggedUserId ? (
              currentUserProfileImage ? (
                <img 
                  src={currentUserProfileImage} 
                  alt={currentUserName || "User"}
                  className="user-avatar"
                  style={{ 
                    alignSelf: 'flex-start',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #e2e8f0'
                  }}
                  onError={(e) => {
                    console.error("Failed to load profile image:", e);
                    e.target.style.display = 'none';
                    setTimeout(() => fetchCurrentUserProfile(loggedUserId), 1000);
                  }}
                />
              ) : (
                <div 
                  className="user-avatar" 
                  style={{ 
                    alignSelf: 'flex-start', 
                    backgroundColor: getAvatarColor(loggedUserId || currentUserEmail),
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    border: '2px solid #e2e8f0'
                  }}
                >
                  {currentUserName ? currentUserName.charAt(0).toUpperCase() : '?'}
                </div>
              )
            ) : (
              <div className="user-avatar" style={{ 
                alignSelf: 'flex-start', 
                backgroundColor: '#cbd5e0',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                border: '2px solid #e2e8f0'
              }}>?</div>
            )}
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              style={{ flex: 1 }}
            />
          </div>
          <button onClick={handleCommentSubmit} style={{ alignSelf: 'flex-end', marginLeft: 'auto', display: 'block' }}>Post</button>
        </div>

        {showDeleteModal && (
          <div className="delete-confirmation-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
              <h4>Delete {isReply ? 'Reply' : 'Comment'}</h4>
              <p>Are you sure you want to delete this {isReply ? 'reply' : 'comment'}? This action cannot be undone.</p>
              <div className="delete-confirmation-buttons">
                <button 
                  className="cancel-delete-btn" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-delete-btn" 
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModal;
