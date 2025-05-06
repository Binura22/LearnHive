import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MainPage.css";
import { useNavigate, Link } from "react-router-dom";
import PostList from "../common/PostList";
import { Book, Share2, User, BookOpen, Layout, Award, Star, Compass } from "lucide-react"; 

const MainPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        try {
          const userResponse = await axios.get("http://localhost:8080/api/user/me", { 
            withCredentials: true 
          });
          if (userResponse.data && userResponse.data.name) {
            setUserName(userResponse.data.name);
          }
        } catch (userError) {
          console.log("Could not fetch user name");
        }

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
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-text">
            <h1>{userName ? `Welcome back, ${userName}!` : 'Welcome to LearnHive'}</h1>
            <p>Your platform for professional growth and skill sharing</p>
          </div>
          <div className="welcome-actions">
            <button onClick={() => navigate("/create-post")} className="create-post-btn">
              <Share2 size={18} />
              Share Your Knowledge
            </button>
          </div>
        </div>
      </div>

      <div className="three-column-layout">
        {/* Left Sidebar */}
        <div className="left-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Navigation</h3>
            <ul className="sidebar-menu">
              <li>
                <Link to={userId ? `/profile/${userId}` : "/profile"} className="sidebar-link">
                  <User size={18} />
                  <span>My Profile</span>
                </Link>
              </li>
              <li>
                <Link to="/learning-plans" className="sidebar-link">
                  <BookOpen size={18} />
                  <span>Learning Plans</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="sidebar-link">
                  <Book size={18} />
                  <span>Browse Courses</span>
                </Link>
              </li>
              <li>
                <Link to="/main" className="sidebar-link">
                  <Layout size={18} />
                  <span>Community</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Categories</h3>
            <ul className="category-list">
              <li><a href="#" className="category-link">Web Development</a></li>
              <li><a href="#" className="category-link">Data Science</a></li>
              <li><a href="#" className="category-link">Mobile Development</a></li>
              <li><a href="#" className="category-link">Machine Learning</a></li>
              <li><a href="#" className="category-link">DevOps</a></li>
            </ul>
          </div>
        </div>

        {/* Main Content (Middle) */}
        <div className="main-content">
          <div className="content-section">
            <div className="section-header">
              <h2>Community Posts</h2>
              <div className="line-decoration"></div>
            </div>

            <div className="recent-posts">
              <PostList posts={posts} />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          <div className="promo-box featured-course">
            <h3>Featured Course</h3>
            <div className="promo-content">
              <img src="/logos/pythonLogo.png" alt="Course" className="promo-image" onError={(e) => {e.target.onerror = null; e.target.src = 'https://placehold.co/300x200/4a90e2/ffffff?text=Featured+Course'}}/>
              <h4>Python For Beginners</h4>
              <div className="rating">
                <Star size={14} fill="#FFD700" stroke="#FFD700" />
                <Star size={14} fill="#FFD700" stroke="#FFD700" />
                <Star size={14} fill="#FFD700" stroke="#FFD700" />
                <Star size={14} fill="#FFD700" stroke="#FFD700" />
                <Star size={14} fill="#FFD700" stroke="#FFD700" />
                <span className="rating-text">5.0</span>
              </div>
              <Link to="/courses"><button className="view-course-btn">View Courses</button></Link>
            </div>
          </div>

          <div className="promo-box trending-topics">
            <h3>Trending Topics</h3>
            <ul className="trending-list">
              <li><a href="#"><Compass size={14} /> React Hooks</a></li>
              <li><a href="#"><Compass size={14} /> Machine Learning Basics</a></li>
              <li><a href="#"><Compass size={14} /> Cloud Computing</a></li>
              <li><a href="#"><Compass size={14} /> Mobile App Development</a></li>
            </ul>
          </div>

          <div className="promo-box join-premium">
            <h3>LearnHive Premium</h3>
            <p>Get unlimited access to all courses and resources</p>
            <div className="premium-features">
              <div className="premium-feature">
                <Award size={16} />
                <span>Exclusive content</span>
              </div>
              <div className="premium-feature">
                <Award size={16} />
                <span>Certificate programs</span>
              </div>
            </div>
            <button className="premium-btn">Upgrade Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
