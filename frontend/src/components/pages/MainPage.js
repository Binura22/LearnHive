import React from 'react';
import './MainPage.css';
import Navbar from '../common/Navbar';
import { useNavigate } from 'react-router-dom';
import PostList from '../common/PostList';

const MainPage = () => {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="main-page">
      <Navbar />
      <div className="main-content">
        <h1>Welcome to LearnHive</h1>
        <p>Start your learning journey today!</p>

        <button onClick={() => navigate("/create-post")} className="create-post-btn">
          Create Post
        </button>

        <PostList />
      </div>
    </div>
  );
};

export default MainPage;
