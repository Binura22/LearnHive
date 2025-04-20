import React, { useState } from "react";
import axios from "axios";
import "./CreatePostForm.css";

const CreatePostForm = () => {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // ✅ New

  const handleFileChange = (e) => {
    setErrorMsg("");
    setSuccessMsg("");

    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith("image/"));
    const videoFiles = selectedFiles.filter(file => file.type.startsWith("video/"));

    if (videoFiles.length > 1 || (videoFiles.length === 1 && imageFiles.length > 0)) {
      setErrorMsg("Please upload either up to 3 images or one video (not both).");
      setFiles([]);
      return;
    }

    if (imageFiles.length > 3) {
      setErrorMsg("You can upload a maximum of 3 images.");
      setFiles([]);
      return;
    }

    if (videoFiles.length === 1) {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          setErrorMsg("Video must be 30 seconds or shorter.");
          setFiles([]);
        } else {
          setFiles(videoFiles); // ✅ valid video
        }
      };

      video.onerror = () => {
        setErrorMsg("Could not load the video file.");
        setFiles([]);
      };

      video.src = URL.createObjectURL(videoFiles[0]);
      return;
    }

    setFiles(imageFiles); // ✅ valid images
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!description || files.length === 0) {
      setErrorMsg("Please add a description and select media.");
      return;
    }

    if (errorMsg) {
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    files.forEach(file => formData.append("media", file));

    try {
      await axios.post("http://localhost:8080/api/posts/create", formData, {
        withCredentials: true, // ✅ keeps session
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setDescription("");
      setFiles([]);
      setSuccessMsg("✅ Post uploaded successfully!");
    } catch (error) {
      console.error("Post creation failed", error);
      setErrorMsg("❌ Failed to upload post. Please try again.");
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
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
      />
      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}
      <button type="submit" disabled={!!errorMsg}>Post</button>
    </form>
  );
};

export default CreatePostForm;
