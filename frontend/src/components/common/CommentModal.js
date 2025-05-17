import React, { useState, useEffect } from "react";
import axios from "axios";
import './CommentModal.css';

const CommentModal = ({ postId, onClose, userEmail, postOwnerEmail, postOwnerName }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState(userEmail || "");
  const [currentUserName, setCurrentUserName] = useState("");
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user/me', { withCredentials: true });
        const email = response.data.email;
        console.log(" API returned user email:", email);
        
        if (email && email !== currentUserEmail) {
          console.log("Updating current user email from API");
          setCurrentUserEmail(email);
          localStorage.setItem('userEmail', email);
        }
        const name = response.data.name;
        if (name) {
          setCurrentUserName(name);
          localStorage.setItem('userName', name);
        }
      } catch (err) {
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) setCurrentUserEmail(storedEmail);
        const storedName = localStorage.getItem('userName');
        if (storedName) setCurrentUserName(storedName);

      }
    };

    fetchUser();
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
    try {
      await axios.post(
        `http://localhost:8080/api/posts/${postId}/comment`,
        { text: commentText },
        { withCredentials: true }
      );
      fetchComments();
      setCommentText("");
      setError(null);
    } catch {
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
              <div className="user-avatar">
                {firstLetter}
              </div>
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
                      {displayName}
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="comment-list">
          {isLoading ? (
            <p>Loading comments...</p>
          ) : comments.length > 0 ? (
            comments.map((c, index) => (
              <div key={c.id || index} className="comment-item">
                <div className="user-avatar">
                  {c.userName?.charAt(0).toUpperCase()}
                </div>
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
                  
                  {c.replies && c.replies.length > 0 && renderReplies(c.replies)}
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet</p>
          )}
        </div>
        {error && <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
        <div className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
          />
          <button onClick={handleCommentSubmit}>Post</button>
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
