import React from 'react';
import './MainPage.css';
import Navbar from '../common/Navbar';

const MainPage = () => {

  return (
    <div className="main-page">
      <Navbar/>

      <div className="main-content">
        <h1>Welcome to LearnHive</h1>
        <p>Start your learning journey today!</p>
      </div>
    </div>
  );
};

export default MainPage; 