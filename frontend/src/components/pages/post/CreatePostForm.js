import React, { useState, useRef } from "react";
import axios from "axios";
import "./CreatePostForm.css";

const CreatePostForm = () => {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef(null); // Add this ref

  const handleFileChange = (e) => {
    setErrorMsg("");
    setSuccessMsg("");

    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const isVideoAlready = files.some(file => file.type.startsWith("video/"));
    const isImageAlready = files.some(file => file.type.startsWith("image/"));

    const newImageFiles = selectedFiles.filter(file => file.type.startsWith("image/"));
    const newVideoFiles = selectedFiles.filter(file => file.type.startsWith("video/"));

    // Mixed media check
    if ((newVideoFiles.length > 0 && (files.length > 0 || newImageFiles.length > 0)) ||
        (newImageFiles.length > 0 && isVideoAlready)) {
      setErrorMsg("You can only upload either 1 video or up to 3 images.");
      return;
    }

    // Handle video
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

    // Handle images
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

    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Reset error if now valid
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
      // Reset file input after successful submission
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
        placeholder="What's on your mind?"
        rows={4}
        required
      />

      <input
        type="file"
        ref={fileInputRef} // Add ref to the file input
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
      />

      <div className="media-preview">
        {previewUrls.map((url, index) => {
          const isVideo = files[index]?.type?.startsWith("video/");
          return (
            <div className="media-container" key={index}>
              {isVideo ? (
                <video src={url} controls width="200" />
              ) : (
                <img src={url} alt={`Preview ${index}`} width="150" />
              )}
              <button
                type="button"
                className="remove-button"
                onClick={() => handleRemoveMedia(index)}
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>

      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}

      <button type="submit" disabled={files.length === 0 || !description}>
        Post
      </button>
    </form>
  );
};

export default CreatePostForm;