import React from 'react';
import CreatePostForm from './CreatePostForm';
import './CreatePostForm.css';

const CreatePostPage = () => {
  return (
    <div className="post-page-container">
      <header className="post-page-header">
        <h2>Create New Post</h2>
      </header>
      <CreatePostForm />
    </div>
  );
};

export default CreatePostPage;
