import React, { useState } from 'react';
import axios from 'axios';
import './CreatePostForm.css';

const CreatePostForm = () => {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files].slice(0, 3)); // max 3
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || files.length === 0) {
      alert("Please add a description and select media.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    files.forEach(file => formData.append("media", file));

    try {
      await axios.post("http://localhost:8080/api/posts/create", formData, {
        withCredentials: false,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Post uploaded!");
      setDescription('');
      setFiles([]);
    } catch (error) {
      console.error("Post creation failed", error);
      alert("Failed to upload post.");
    }
  };

  return (
    <form className="create-post-form" onSubmit={handleSubmit}>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What's on your mind?"
        rows={4}
        required
      />
      <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} />
      <button type="submit">Post</button>
    </form>
  );
};

export default CreatePostForm;
