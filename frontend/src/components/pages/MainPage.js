import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MainPage.css";
import { useNavigate } from "react-router-dom";
import PostList from "../common/PostList";

const MainPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts
        const postsResponse = await axios.get("http://localhost:8080/api/posts/all", { 
          withCredentials: true 
        });
        const sortedPosts = postsResponse.data.sort((postA, postB) => 
          new Date(postB.createdAt) - new Date(postA.createdAt)
        );
        setPosts(sortedPosts);

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);  

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="main-page">
      <div className="welcome-section">
        <h1>Welcome to LearnHive</h1>
        <p>Your platform for professional growth and skill sharing</p>
        <div className="welcome-actions">
          <button onClick={() => navigate("/create-post")} className="create-post-btn">
            Share Your Knowledge
          </button>
        </div>
      </div>

      <div className="recent-posts">
        <PostList posts={posts} />
      </div>
    </div>
  );
};

export default MainPage;
