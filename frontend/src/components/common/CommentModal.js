import React, { useState, useEffect } from "react";
import axios from "axios";
import './CommentModal.css';

const CommentModal = ({ postId, onClose, userEmail, postOwnerEmail, postOwnerName }) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState(userEmail || "");
  const [isPostOwner, setIsPostOwner] = useState(false);

  useEffect(() => {

    console.log("Initial currentUserEmail:", currentUserEmail);
    console.log("Prop userEmail:", userEmail);
    

    axios.get('http://localhost:8080/api/user/me', { withCredentials: true })
      .then(response => {
        const email = response.data.email;
        console.log(" API returned user email:", email);
        
        if (email && email !== currentUserEmail) {
          console.log("Updating current user email from API");
          setCurrentUserEmail(email);
          

          localStorage.setItem('userEmail', email);
        }
      })
      .catch(err => {
        console.error("Failed to fetch user email from API:", err);
        
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail && !currentUserEmail) {
          console.log("Using email from localStorage:", storedEmail);
          setCurrentUserEmail(storedEmail);
        }
      });
      
    fetchComments();
  }, [postId]); 

  useEffect(() => {
    if (currentUserEmail && postOwnerEmail) {
      const normalizedCurrentEmail = String(currentUserEmail).toLowerCase().trim();
      const normalizedOwnerEmail = String(postOwnerEmail).toLowerCase().trim();
      
      const isOwner = normalizedCurrentEmail === normalizedOwnerEmail;
      
      console.log(`OWNERSHIP CHECK: ${normalizedCurrentEmail} vs ${normalizedOwnerEmail} => ${isOwner}`);
      setIsPostOwner(isOwner);
    } else {
      setIsPostOwner(false);
    }
  }, [currentUserEmail, postOwnerEmail]);

  const fetchComments = () => {
    setIsLoading(true);
    axios.get(`http://localhost:8080/api/posts/${postId}`, { withCredentials: true })
      .then((res) => {
        const post = res.data;
        console.log("Fetched post:", post);
        
        const commentsData = post.comments || [];
        console.log("Raw comments:", commentsData);
        
        const processedComments = commentsData.map(comment => {
          const processed = {...comment};
          
          if (!processed.id || processed.id === 'null' || processed.id === 'undefined') {

            processed.id = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            console.warn("Fixed missing ID for comment:", processed.text);
          }
          
          return processed;
        });
        
        setComments(processedComments);
      })
      .catch(err => {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments");
      })
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
    } catch (err) {
      console.error("Failed to post comment:", err);
      setError("Failed to post comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId, index) => {
    if (!commentId || commentId.startsWith('temp-')) {
      console.log("Using index-based deletion as fallback");
      try {
        const response = await axios.delete(
          `http://localhost:8080/api/posts/${postId}/comment/by-index/${index}`, 
          { withCredentials: true }
        );
        console.log("Delete by index response:", response.data);
        setError(null);
        fetchComments();
      } catch (err) {
        console.error("Failed to delete by index:", err);
        setError("Failed to delete comment by position. Try refreshing the page.");
      }
    } else {
      try {      
        console.log(`Deleting comment with ID: ${commentId}`);
        const response = await axios.delete(
          `http://localhost:8080/api/posts/${postId}/comment/by-id/${commentId}`, 
          { withCredentials: true }
        );
        
        console.log("Delete response:", response.data);
        setError(null);
        fetchComments();
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete comment. You may not have permission.");
      }
    }
  };

  return (
    <div className="modal-overlay"> 
      <div className="modal-content"> 
        <button onClick={onClose} className="close-button">X</button>
  
        <div className="comment-list"> 
          {isLoading ? (
            <p>Loading comments...</p>
          ) : comments.length > 0 ? (
            comments.map((c, index) => {
              const userName = c.userId || "Unknown";
              const firstInitial = userName.charAt(0).toUpperCase();
              
              return (
                <div 
                  key={c.id || index} 
                  className="comment-item"
                  style={{
                    display: 'flex',
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    alignItems: 'flex-start'
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
                      fontSize: '14px',
                      flexShrink: 0
                    }}
                  >
                    {firstInitial}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>{userName}</div>
                      
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteComment(c.id, index)}
                        style={{
                          backgroundColor: '#ff4d4d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '2px 8px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    <div>{c.text}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No comments yet</p>
          )}
        </div>
  
        {error && (
          <div className="error-message" style={{
            color: 'red',
            padding: '8px',
            margin: '10px 0',
            background: '#ffeeee',
            border: '1px solid #ffcccc',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
  
        <div className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical',
              minHeight: '60px'
            }}
          />
          <button 
            onClick={handleCommentSubmit}
            style={{
              marginTop: '8px',
              padding: '8px 16px',
              background: '#3b5998',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
