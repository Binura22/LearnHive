import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostItem from './PostItem';

const PostList = ({ posts: propPosts, filterByUserId = null }) => {
  const [posts, setPosts] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const handlePostDelete = (deletedPostId) => {
    console.log("Post deleted:", deletedPostId);
    setPosts(posts.filter(post => post.id !== deletedPostId));
  };

  useEffect(() => {
    axios.defaults.withCredentials = true;

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


    if (propPosts) {
      let filteredPosts = [...propPosts];
      if (filterByUserId) {
        filteredPosts = filteredPosts.filter(post => post.userId === filterByUserId);
      }
      setPosts(filteredPosts);
      setLoading(false);
      return;
    }

    console.log("Fetching posts...");
    axios.get('http://localhost:8080/api/posts', { withCredentials: true })
      .then(response => {
        console.log(" Posts fetched successfully:", response.data.length);
        if (response.data.length > 0) {
          console.log("First post:", response.data[0]);
        }
        let fetchedPosts = response.data;

        if (filterByUserId) {
          fetchedPosts = fetchedPosts.filter(post => post.userId === filterByUserId);
        }

        setPosts(fetchedPosts);
        setPostsError(null);
      })
      .catch(error => {
        console.error("Error fetching posts:", error);

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
  }, [authChecked, propPosts, filterByUserId]);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (postsError) {
    return <div className="error-message">{postsError}</div>;
  }

  return (
    <div className="post-list">
      {posts.length === 0 ? (
        <div className="no-posts">No posts available</div>
      ) : (
        posts.map(post => (
          <PostItem
            key={post.id}
            post={post}
            userEmail={userEmail}
            onPostDelete={handlePostDelete}  
          />
        ))
      )}
    </div>
  );
};

export default PostList;
