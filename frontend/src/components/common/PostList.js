import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostItem from './PostItem';

const PostList = ({ filterByUserId = null }) => {
  const [posts, setPosts] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);


  useEffect(() => {
    axios.defaults.withCredentials = true;

    // add request interceptor for debugging
    axios.interceptors.request.use(request => {
      console.log('Starting Request:', request.url);
      return request;
    });
  }, []);


  useEffect(() => {
    console.log("Checking authentication status...");
    setLoading(true);


    const authEndpoints = [
      'http://localhost:8080/api/user/me',
      'http://localhost:8080/api/users/current',
      'http://localhost:8080/api/auth/user'
    ];


    const tryEndpoints = async () => {
      for (let endpoint of authEndpoints) {
        try {
          console.log(`Trying to authenticate with: ${endpoint}`);
          const response = await axios.get(endpoint, { withCredentials: true });
          if (response.data && response.data.email) {
            console.log(` Authentication successful with ${endpoint}:`, response.data.email);


            setUserEmail(response.data.email);
            localStorage.setItem('userEmail', response.data.email);

            setAuthChecked(true);
            return true;
          }
        } catch (error) {
          console.log(`Failed with ${endpoint}:`, error.message);
        }
      }


      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) {
        console.log("Using email from localStorage:", storedEmail);
        setUserEmail(storedEmail);
      }

      setAuthChecked(true);
      return false;
    };

    tryEndpoints();
  }, []);


  useEffect(() => {
    if (!authChecked) return;

    console.log("Fetching posts...");

    axios.get('http://localhost:8080/api/posts', { withCredentials: true })
      .then(response => {
        console.log(" Posts fetched successfully:", response.data.length);
        if (response.data.length > 0) {
          console.log("First post:", response.data[0]);
        }
        let fetchedPosts = response.data;

        // filter only that user's posts
        if (filterByUserId) {
          fetchedPosts = fetchedPosts.filter(post => post.userId === filterByUserId);
        }

        setPosts(fetchedPosts);
        setPostsError(null);
      })
      .catch(error => {
        console.error("Error fetching posts:", error);

// detailed error logging
        if (error.response) {
          setPostsError(`Failed to fetch posts: ${error.response.status}`);
        } else if (error.request) {
          setPostsError("Failed to fetch posts: No response from server");
        } else {
          setPostsError(`Failed to fetch posts: ${error.message}`);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authChecked]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Only show user email */}
      {userEmail && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
          <strong>Logged in as:</strong> {userEmail}
        </div>
      )}

      {postsError && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
          <strong>Error:</strong> {postsError}
          <button
            onClick={() => window.location.reload()}
            style={{ marginLeft: '10px', padding: '4px 8px' }}
          >
            Try Again
          </button>
        </div>
      )}

      {posts && posts.length > 0 ? (
        posts.map(post => (
          <PostItem
            key={post.id}
            post={post}
            userEmail={userEmail} // Logged-in user's email
          />
))
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>No posts available.</p>
        </div>
      )}
    </div>
  );
};

export default PostList;
