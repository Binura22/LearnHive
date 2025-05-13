import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { renderProgressImage, canvasToFile } from '../../utils/progressImageGenerator';
import './ProgressShareModal.css';

const ProgressShareModal = ({ isOpen, onClose, course, progress }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canvasRef = useRef(null);
  
  // Ensure course object has required properties
  const courseTitle = course?.title || 'this course';
  const courseCategory = course?.category || 'Learning';

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      renderProgressImage(canvasRef.current, progress, courseTitle);
    }
  }, [isOpen, progress, courseTitle]);

  const handleFileChange = (e) => {
    setError('');
    setSuccess('');
    
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check if file is image
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleRemoveMedia = () => {
    setFile(null);
    setPreviewUrl('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      
      // Add description or default text
      formData.append('description', description || `I've completed ${progress}% of ${courseTitle}! 🎉 #LearningProgress #${courseCategory}`);
      
      // Add either the user's photo or the generated progress image
      if (file) {
        formData.append('media', file);
      } else {
        // Generate a progress image using canvas if no file is uploaded
        const progressImage = await canvasToFile(canvasRef.current);
        formData.append('media', progressImage);
      }
      
      await axios.post('http://localhost:8080/api/posts/create', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('✅ Progress shared successfully!');
      setFile(null);
      setPreviewUrl('');
      setDescription('');
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to share progress:', error);
      setError('❌ Failed to share progress. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="progress-share-modal">
        <h2>Share Your Progress</h2>
        <p>You've completed {progress}% of {courseTitle}!</p>
        
        {/* Hidden canvas to generate the progress image */}
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={150} 
          style={{ display: 'none' }}
        />
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`I've completed ${progress}% of ${courseTitle}! 🎉 #LearningProgress #${courseCategory}`}
            rows={4}
          />
          
          <div className="file-upload-section">
            <label>
              Add a photo (optional):
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
            
            {previewUrl && (
              <div className="media-preview">
                <img src={previewUrl} alt="Preview" width="150" />
                <button
                  type="button"
                  className="remove-button"
                  onClick={handleRemoveMedia}
                >
                  &times;
                </button>
              </div>
            )}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="modal-buttons">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Share</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgressShareModal;