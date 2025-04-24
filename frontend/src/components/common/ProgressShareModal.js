import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { renderProgressImage, canvasToFile } from '../../utils/progressImageGenerator';
import './ProgressShareModal.css';

const ProgressShareModal = ({ isOpen, onClose, course, progress }) => {
  const [description, setDescription] = useState('');
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Generate a progress image using canvas
      const progressImage = await canvasToFile(canvasRef.current);
      
      const formData = new FormData();
      formData.append('description', description || `I've completed ${progress}% of ${courseTitle}! 🎉 #LearningProgress #${courseCategory}`);
      formData.append('media', progressImage);
      
      await axios.post('http://localhost:8080/api/posts/create', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Progress shared successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to share progress:', error);
      setError('Failed to share progress. Please try again.');
    }
  };

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