import React, { useState, useRef } from "react";
import axios from "axios";
import "./CreatePostForm.css";

const CreatePostForm = () => {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef(null); 

  const handleFileChange = (e) => {
    setErrorMsg("");
    setSuccessMsg("");

    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const isVideoAlready = files.some(file => file.type.startsWith("video/"));
    const isImageAlready = files.some(file => file.type.startsWith("image/"));

    const newImageFiles = selectedFiles.filter(file => file.type.startsWith("image/"));
    const newVideoFiles = selectedFiles.filter(file => file.type.startsWith("video/"));


    if ((newVideoFiles.length > 0 && (files.length > 0 || newImageFiles.length > 0)) ||
        (newImageFiles.length > 0 && isVideoAlready)) {
      setErrorMsg("You can only upload either 1 video or up to 3 images.");
      return;
    }

    if (newVideoFiles.length === 1) {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          setErrorMsg("Video must be 30 seconds or shorter.");
        } else {
          setFiles([newVideoFiles[0]]);
          setPreviewUrls([URL.createObjectURL(newVideoFiles[0])]);
        }
      };

      video.onerror = () => {
        setErrorMsg("Could not load the video file.");
      };

      video.src = URL.createObjectURL(newVideoFiles[0]);
      return;
    }

    if (newImageFiles.length > 0) {
      const totalImages = files.length + newImageFiles.length;

      if (totalImages > 3) {
        const allowedToAdd = 3 - files.length;
        const filesToAdd = newImageFiles.slice(0, allowedToAdd);

        const newFiles = [...files, ...filesToAdd];
        const newPreviews = [...previewUrls, ...filesToAdd.map(f => URL.createObjectURL(f))];

        setFiles(newFiles);
        setPreviewUrls(newPreviews);
        setErrorMsg("You can only upload up to 3 images.");
      } else {
        const newFiles = [...files, ...newImageFiles];
        const newPreviews = [...previewUrls, ...newImageFiles.map(f => URL.createObjectURL(f))];

        setFiles(newFiles);
        setPreviewUrls(newPreviews);
      }
    }
  };

  const handleRemoveMedia = (index) => {
    const updatedFiles = [...files];
    const updatedPreviews = [...previewUrls];

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);


    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }


    if (updatedFiles.every(f => f.type.startsWith("image/")) && updatedFiles.length <= 3) {
      setErrorMsg("");
    }

    if (updatedFiles.length === 0) {
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!description || files.length === 0) {
      setErrorMsg("Please add a description and select media.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    files.forEach(file => formData.append("media", file));

    try {
      await axios.post("http://localhost:8080/api/posts/create", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDescription("");
      setFiles([]);
      setPreviewUrls([]);
      setErrorMsg("");
      setSuccessMsg("✅ Post uploaded successfully!");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        placeholder="Share your knowledge or ask a question..."
        required
      />

      <div className="file-input-container">
        <label htmlFor="media-upload" className="file-input-label">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2zM7 9l1.41 1.41L11 7.83V16h2V7.83l2.59 2.58L17 9l-5-5-5 5z"/>
          </svg>
          Select images or video to upload
        </label>
        <input
          id="media-upload"
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
        />
      </div>

      <div className="media-preview">
        {previewUrls.map((url, index) => {
          const isVideo = files[index]?.type?.startsWith("video/");
          return (
            <div className="media-container" key={index}>
              {isVideo ? (
                <video src={url} controls width="150" height="100" />
              ) : (
                <img src={url} alt={`Preview ${index}`} width="120" height="100" />
              )}
              <button
                type="button"
                className="remove-button"
                onClick={() => handleRemoveMedia(index)}
                title="Remove"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <div className="message-container">
          {errorMsg && <div className="error-message">⚠️ {errorMsg}</div>}
          {successMsg && <div className="success-message">✅ {successMsg}</div>}
        </div>
        <button type="submit" disabled={files.length === 0 || !description}>
          Publish Post
        </button>
      </div>
    </form>
  );
};

export default CreatePostForm;