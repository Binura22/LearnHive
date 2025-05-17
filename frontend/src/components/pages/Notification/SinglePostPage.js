import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./SinglePostPage.css";
import { getUserById } from "../../../services/api";

function SinglePostPage({ postId: propPostId }) {
  const params = useParams();
  const postId = propPostId || params.postId;
  const [post, setPost] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [userProfileImages, setUserProfileImages] = useState({});
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/user/me', { withCredentials: true });
        if (response.data.profileImage) {
          setCurrentUserProfileImage(response.data.profileImage);
        } else {
          const storedImage = localStorage.getItem('userProfileImage');
          if (storedImage) setCurrentUserProfileImage(storedImage);
        }
      } catch (err) {
        const storedImage = localStorage.getItem('userProfileImage');
        if (storedImage) setCurrentUserProfileImage(storedImage);
      }
    };
    
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!postId) return;
    axios
      .get(`http://localhost:8080/api/posts/${postId}`)
      .then((res) => {
        setPost(res.data);
        fetchUserProfileImages(res.data);
      })
      .catch((err) => console.error("Error fetching post:", err));
  }, [postId]);
  
  const fetchUserProfileImages = async (post) => {
    const profiles = { ...userProfileImages };
    

    if (post.userId && !profiles[post.userId]) {
      try {
        const response = await getUserById(post.userId);
        if (response.data && response.data.profileImage) {
          profiles[post.userId] = response.data.profileImage;
        }
      } catch (error) {
        console.error(`Failed to fetch profile for user ${post.userId}:`, error);
      }
    }
    

    if (post.comments && post.comments.length > 0) {
      for (const comment of post.comments) {
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
        
        if (comment.replies && comment.replies.length > 0) {
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
    }
    
    setUserProfileImages(profiles);
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      await axios.post(
        `http://localhost:8080/api/posts/${postId}/comment/${commentId}/reply`,
        { text: replyText },
        { withCredentials: true }
      );
      const res = await axios.get(`http://localhost:8080/api/posts/${postId}`);
      setPost(res.data);
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      alert("Failed to reply");
    }
    setReplyLoading(false);
  };

  const renderReplies = (replies) => (
    <div className="single-post-replies">
      {replies.map((reply, idx) => (
        <div key={reply.id || idx} className="single-post-comment single-post-reply">
          {userProfileImages[reply.userId] ? (
            <img 
              src={userProfileImages[reply.userId]} 
              alt={reply.userName}
              className="single-post-comment-avatar" 
              style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%" }}
            />
          ) : (
            <div className="single-post-comment-avatar">
              {reply.userName ? reply.userName.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div>
            <div className="single-post-comment-user">{reply.userName || "Unknown User"}</div>
            <div className="single-post-comment-text">{reply.text}</div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!post) {
    return <div className="single-post-loading">Loading...</div>;
  }

  return (
    <div className="single-post-card">
      <div className="single-post-header">
        {userProfileImages[post.userId] ? (
          <img 
            src={userProfileImages[post.userId]} 
            alt={post.userName}
            className="single-post-avatar" 
            style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%" }}
          />
        ) : (
          <div className="single-post-avatar">
            {post.userName ? post.userName.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        <div>
          <div className="single-post-author">{post.userName}</div>
          <div className="single-post-date">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
      <div className="single-post-description">{post.description}</div>
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="single-post-media">
          {post.mediaUrls.map((url, index) =>
            url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video key={index} controls className="single-post-media-item">
                <source src={url} />
              </video>
            ) : (
              <img
                key={index}
                src={url}
                alt={`media-${index}`}
                className="single-post-media-item"
              />
            )
          )}
        </div>
      )}
      <div className="single-post-stats">
        <span>
          <strong>{post.likedUserIds ? post.likedUserIds.length : 0}</strong> Likes
        </span>
        <span>
          <strong>{post.comments ? post.comments.length : 0}</strong> Comments
        </span>
      </div>
      <div className="single-post-comments-section">
        <h4>Comments</h4>
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment, index) => (
            <div key={comment.id || index} className="single-post-comment">
              {userProfileImages[comment.userId] ? (
                <img 
                  src={userProfileImages[comment.userId]} 
                  alt={comment.userName}
                  className="single-post-comment-avatar" 
                  style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%" }}
                />
              ) : (
                <div className="single-post-comment-avatar">
                  {comment.userName ? comment.userName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              
              <div style={{ flex: 1 }}>
                <div className="single-post-comment-user">{comment.userName || "Unknown User"}</div>
                <div className="single-post-comment-text">{comment.text}</div>
                <span
                  className="single-post-reply-btn"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  Reply
                </span>
                {replyingTo === comment.id && (
                  <div className="single-post-reply-form">
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      {currentUserProfileImage ? (
                        <img 
                          src={currentUserProfileImage} 
                          alt="You"
                          style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "50%", 
                            objectFit: "cover" 
                          }}
                        />
                      ) : (
                        <div style={{ 
                          width: "32px", 
                          height: "32px", 
                          borderRadius: "50%",
                          backgroundColor: "#3b82f6", 
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "bold"
                        }}>
                          Y
                        </div>
                      )}
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        style={{ flex: 1, marginTop: '8px', padding: '8px' }}
                        rows={2}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleReply(comment.id)} disabled={replyLoading}>
                        {replyLoading ? "Replying..." : "Reply"}
                      </button>
                      <button onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {comment.replies && comment.replies.length > 0 && renderReplies(comment.replies)}
              </div>
            </div>
          ))
        ) : (
          <div className="single-post-no-comments">No comments yet.</div>
        )}
      </div>
    </div>
  );
}

export default SinglePostPage;
