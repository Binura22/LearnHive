import React, { useState, useEffect } from "react";
import axios from "axios";
import './CommentModal.css';


const CommentModal = ({ postId, onClose }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    //post to get comments
    axios.get(`http://localhost:8080/api/posts/${postId}`)
      .then((res) => {
        setComments(res.data.comments || []);
      });
  }, [postId]);

  const [error, setError] = useState(null);
  const handleCommentSubmit = async () => {
    try {
      await axios.post(`http://localhost:8080/api/posts/${postId}/comment`, { text: commentText }, { withCredentials: true });
      const res = await axios.get(`http://localhost:8080/api/posts/${postId}`);
      setComments(res.data.comments || []);
      setCommentText("");
      setError(null); 
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError("Failed to post comment. Please try again.");
    }
  };

  return (
    <div className="modal-overlay"> 
      <div className="modal-content"> 
        <button onClick={onClose} className="close-button">X</button>
  
        <div className="comment-list"> 
          {comments.map((c, i) => (
            <div key={i} className="comment-item"> 
              <strong>{c.userId || "Unknown"}:</strong> {c.text}
            </div>
          ))}
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
