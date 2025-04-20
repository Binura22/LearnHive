import React, { useState, useEffect } from "react";
import axios from "axios";
import './CommentModal.css';

const CommentModal = ({ postId, onClose }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Fetch post to get comments
    axios.get(`/api/posts/${postId}`)
      .then((res) => {
        setComments(res.data.comments || []);
      });
  }, [postId]);

  const handleCommentSubmit = async () => {
    try {
      await axios.post(`/api/posts/${postId}/comment`, { text: commentText });
      setComments([...comments, { text: commentText, userId: "You", timestamp: new Date() }]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  return (
    <div className="comment-modal-background">
      <div className="comment-modal">
        <button onClick={onClose} className="close-button">X</button>
        <div className="comments-list">
          {comments.map((c, i) => (
            <div key={i} className="comment">
              <strong>{c.userId || "Unknown"}:</strong> {c.text}
            </div>
          ))}
        </div>
        <div className="comment-form">
          <input
            type="text"
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
