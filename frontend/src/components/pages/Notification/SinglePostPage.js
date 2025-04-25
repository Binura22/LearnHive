import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./SinglePostPage.css";

function SinglePostPage({ postId: propPostId }) {
  const params = useParams();
  const postId = propPostId || params.postId;
  const [post, setPost] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (!postId) return;
    axios
      .get(`http://localhost:8080/api/posts/${postId}`)
      .then((res) => {
        setPost(res.data);
      })
      .catch((err) => console.error("Error fetching post:", err));
  }, [postId]);

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
          <div className="single-post-comment-avatar">
            {reply.userId ? reply.userId.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="single-post-comment-user">{reply.userId}</div>
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
        <div className="single-post-avatar">
          {post.userName ? post.userName.charAt(0).toUpperCase() : "U"}
        </div>
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
              <div className="single-post-comment-avatar">
                {comment.userId ? comment.userId.charAt(0).toUpperCase() : "U"}
              </div>
              <div style={{ flex: 1 }}>
                <div className="single-post-comment-user">{comment.userId}</div>
                <div className="single-post-comment-text">{comment.text}</div>
                <span
                  className="single-post-reply-btn"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  Reply
                </span>
                {replyingTo === comment.id && (
                  <div className="single-post-reply-form">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                    />
                    <button onClick={() => handleReply(comment.id)} disabled={replyLoading}>
                      {replyLoading ? "Replying..." : "Reply"}
                    </button>
                    <button onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                      Cancel
                    </button>
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
