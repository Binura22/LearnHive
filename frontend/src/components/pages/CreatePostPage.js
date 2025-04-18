import React from 'react';
import Navbar from '../common/Navbar';
import CreatePostForm from './CreatePostForm';

const CreatePostPage = () => {
  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h2>Create a New Post</h2>
        <CreatePostForm />
      </div>
    </>
  );
};

export default CreatePostPage;
