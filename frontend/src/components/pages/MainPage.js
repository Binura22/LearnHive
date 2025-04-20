import React from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="main-page">
      <div className="main-content">
        <h1>Welcome to LearnHive</h1>
        <p>Start your learning journey today!</p>

        <button onClick={() => navigate("/create-post")} className="create-post-btn">
          Create Post
        </button>
      </div>
    </div>
  );
};

export default MainPage;
