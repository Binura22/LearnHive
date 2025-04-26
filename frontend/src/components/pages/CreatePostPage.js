import React from 'react';
import CreatePostForm from './CreatePostForm';

const CreatePostPage = () => {
  return (
    <>
      <div style={{ padding: '2rem' }}>
        <h2>New Post</h2>
        <CreatePostForm />
      </div>
    </>
  );
};

export default CreatePostPage;
