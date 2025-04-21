import React, { useState } from "react";
import "./PostItem.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";

const PostItem = ({ post, setPosts, posts }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(post.description);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/posts/${post.id}`, {
        withCredentials: true,
      });
      const updatedPosts = posts.filter((p) => p.id !== post.id);
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put(`http://localhost:8080/api/posts/${post.id}`, {
        description: newDescription,
      }, {
        withCredentials: true,
      });

      const updatedPosts = posts.map((p) =>
        p.id === post.id ? { ...p, description: newDescription } : p
      );
      setPosts(updatedPosts);
      setIsEditing(false);
    } catch (error) {
      console.error("Edit failed:", error);
    }
  };

  return (
    <div className="postItem">
      <div className="postHeader">
        <div className="three-dots" onClick={() => setShowMenu(!showMenu)}>
          <BsThreeDotsVertical />
          {showMenu && (
            <div className="dropdown-menu">
              <div onClick={() => setIsEditing(true)}>✏️ Edit Post</div>
              <div onClick={handleDelete}>🗑️ Delete Post</div>
            </div>
          )}
        </div>
      </div>

      <div className="postImage">
        {post.mediaUrls?.length > 0 && (
          <img src={post.mediaUrls[0]} alt="Post" />
        )}
      </div>

      <div className="postContent">
        {isEditing ? (
          <div className="edit-section">
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <button onClick={handleEdit}>✅ Save</button>
            <button onClick={() => setIsEditing(false)}>❌ Cancel</button>
          </div>
        ) : (
          <>
            <p className="postDescription">{post.description}</p>
            <p className="postTime">{new Date(post.createdAt).toLocaleString()}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PostItem;
