import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MainPage.css";
import { useNavigate } from "react-router-dom";
import PostList from "../common/PostList";

const MainPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editStates, setEditStates] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/posts/all", { withCredentials: true })
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Failed to fetch posts", err));
  }, []);

  return (
    <div className="main-page">
      <div className="main-content">
        <h1>Welcome to LearnHive</h1>
        <p>Start your learning journey today!</p>

        <button
          onClick={() => navigate("/create-post")}
          className="create-post-btn"
        >
          Create Post
        </button>

        <div className="post-feed">
          {posts.map((post) => {
            const isMenuOpen = activeMenuId === post.id;
            const isEditing = editStates[post.id]?.editing || false;
            const newDescription =
              editStates[post.id]?.description || post.description;

            const toggleMenu = (id) => {
              setActiveMenuId(activeMenuId === id ? null : id);
            };

            const handleDelete = async () => {
              try {
                await axios.delete(
                  `http://localhost:8080/api/posts/${post.id}`,
                  {
                    withCredentials: true,
                  }
                );
                setPosts(posts.filter((p) => p.id !== post.id));
              } catch (error) {
                console.error("Delete failed:", error);
              }
            };

            const handleEdit = async () => {
              try {
                await axios.put(
                  `http://localhost:8080/api/posts/${post.id}`,
                  { description: newDescription },
                  { withCredentials: true }
                );
                const updated = posts.map((p) =>
                  p.id === post.id ? { ...p, description: newDescription } : p
                );
                setPosts(updated);
                setEditStates((prev) => ({
                  ...prev,
                  [post.id]: { editing: false, description: newDescription },
                }));
              } catch (error) {
                console.error("Edit failed:", error);
              }
            };

            const startEditing = () => {
              setEditStates((prev) => ({
                ...prev,
                [post.id]: { editing: true, description: post.description },
              }));
            };

            const cancelEditing = () => {
              setEditStates((prev) => ({
                ...prev,
                [post.id]: { editing: false, description: post.description },
              }));
            };

            const handleDescriptionChange = (e) => {
              setEditStates((prev) => ({
                ...prev,
                [post.id]: { ...prev[post.id], description: e.target.value },
              }));
            };

            return (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div
                    className="menu-toggle"
                    onClick={() => toggleMenu(post.id)}
                  >
                    ⋮
                  </div>
                  {isMenuOpen && (
                    <div className="dropdown-menu">
                      <div onClick={startEditing}>✏️ Edit</div>
                      <div onClick={handleDelete}>🗑️ Delete</div>
                    </div>
                  )}
                </div>

                <div className="post-body">
                  {isEditing ? (
                    <div>
                      <textarea
                        value={newDescription}
                        onChange={handleDescriptionChange}
                      />
                      <button onClick={handleEdit}>Save</button>
                      <button onClick={cancelEditing}>Cancel</button>
                    </div>
                  ) : (
                    <p>{post.description}</p>
                  )}
                  <div className="media-container">
                    {post.mediaUrls.map((url, index) => {
                      if (url.match(/\.(mp4|webm|ogg)$/i)) {
                        return (
                          <video key={index} controls width="300" height="200">
                            <source src={url} />
                          </video>
                        );
                      }
                      return (
                        <img key={index} src={url} alt="post" width="300" />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <PostList />
      </div>
    </div>
  );
};

export default MainPage;
