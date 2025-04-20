import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostItem from './PostItem';

const PostList = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/posts')
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.error("Error fetching posts:", error);
      });
  }, []);

  return (
    <div>
    {posts.length > 0 ? (
      posts.map(post => (
        <PostItem key={post.id} post={post} />
      ))
    ) : (
      <p>No posts available</p>
    )}
  </div>
  );
};

export default PostList;
