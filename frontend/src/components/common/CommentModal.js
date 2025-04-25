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

  const getAvatarColor = (userId) => {
    const colors = ["#2563eb", "#4caf50", "#ff9800", "#e91e63", "#9c27b0"];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderReplies = (replies) => (
    <div className="single-post-replies">
      {replies.map((reply, idx) => (
        <div key={reply.id || idx} className="single-post-reply">
          <div className="user-avatar">
            {reply.userId.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="comment-header">
              <a href={`/profile/${encodeURIComponent(reply.userId)}`} className="comment-user">
                {reply.userName}
              </a>
            </div>
            <div className="comment-text">{reply.text}</div>
          </div>
        </div>
      ))}
    </div>
  );

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
                  {c.userId.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="comment-header">
                    <a href={`/profile/${encodeURIComponent(c.userId)}`} className="comment-user">
                      {c.userName}
                    </a>
                    {(currentUserEmail === c.userEmail || isPostOwner) && (
                      <button className="delete-btn" onClick={() => console.log("Delete comment")}>
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="comment-text">{c.text}</div>
                  <span className="single-post-reply-btn" onClick={() => setReplyingTo(c.id)}>
                    Reply
                  </span>
                  {replyingTo === c.id && (
                    <div className="single-post-reply-form">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                      />
                      <button
                        onClick={() => handleReplySubmit(c.id)}
                        disabled={replyLoading}
                      >
                        {replyLoading ? "Replying..." : "Reply"}
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </button>
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
        {error && <div className="error-message">{error}</div>}
        <div className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
          />
          <button onClick={handleCommentSubmit}>Post</button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
