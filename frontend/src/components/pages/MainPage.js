import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import PostList from '../common/PostList';

const MainPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  // Fetch posts from the server
  useEffect(() => {
    axios.get("http://localhost:8080/api/posts/all", { withCredentials: true })
      .then(res => setPosts(res.data))
      .catch(err => console.error("Failed to fetch posts", err));
  }, []);

  return (
    <div className="main-page">
      <div className="main-content">
        <h1>Welcome to LearnHive</h1>
        <p>Start your learning journey today!</p>

        <button onClick={() => navigate("/create-post")} className="create-post-btn">
          Create Post
        </button>

        {/* Display posts with media rendering support */}
        <div className="post-feed">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <p>{post.description}</p>
              <div className="media-container">
                {post.mediaUrls.map((url, index) => {
                  if (url.match(/\.(mp4|webm|ogg)$/i)) {
                    return (
                      <video key={index} controls width="300" height="200">
                        <source src={url} />
                      </video>
                    );
                  }
                  return <img key={index} src={url} alt="post" width="300" />;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Also include PostList component for additional functionality */}
        <PostList />
      </div>
    </div>
  );
};

export default MainPage;
