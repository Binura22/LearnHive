import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function SinglePostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/posts/${postId}`)
      .then((res) => {
        console.log("Fetched post:", res.data);
        setPost(res.data);
      })
      .catch((err) => console.error("Error fetching post:", err));
  }, [postId]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
    <h2>Posted by {post.userName}</h2>
    <p>{post.description}</p>

    {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div>
        {post.mediaUrls.map((url, index) => (
            <img
            key={index}
            src={url}
            alt={`media-${index}`}
            style={{ maxWidth: "100%", marginTop: "10px" }}
            />
        ))}
        </div>
    )}

    <p><small>{new Date(post.createdAt).toLocaleString()}</small></p>

    <div style={{ marginTop: "30px" }}>
        <h4>Comments:</h4>
        {post.comments && post.comments.length > 0 ? (
        post.comments.map((comment, index) => (
            <div key={index} style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
            <p><strong>{comment.userId}</strong>: {comment.text}</p>
            </div>
        ))
        ) : (
        <p>No comments yet.</p>
        )}
    </div>
    </div>

  );
}

export default SinglePostPage;
