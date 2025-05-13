import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { renderProgressImage, canvasToFile } from '../../utils/progressImageGenerator';
import './ProgressShareModal.css';

const progressTypes = [
  {
    id: 'milestone',
    label: 'Milestone Reached',
    emoji: '🎯',
    template: (progress, title) => `Just hit ${progress}% on ${title}! Making steady progress 🎯 #LearningJourney`
  },
  {
    id: 'skill',
    label: 'New Skill Learned',
    emoji: '💡',
    template: (progress, title) => `Learned something new in ${title}! Now at ${progress}% completion 💡 #SkillUp`
  },
  {
    id: 'completion',
    label: 'Course Completion',
    emoji: '🏆',
    template: (progress, title) => `Completed ${progress}% of ${title}! ${progress === 100 ? 'Course finished! 🏆' : 'Almost there!'} #AchievementUnlocked`
  },
  {
    id: 'custom',
    label: 'Custom Update',
    emoji: '✏️',
    template: (progress, title) => `My update about ${title}...`
  }
];

const ProgressShareModal = ({ isOpen, onClose, course, progress }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedType, setSelectedType] = useState(progressTypes[0]);
  const canvasRef = useRef(null);
  
  const courseTitle = course?.title || 'this course';
  const courseCategory = course?.category || 'Learning';

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      renderProgressImage(canvasRef.current, progress, courseTitle);
      // Reset form when opening
      setDescription('');
      setFile(null);
      setPreviewUrl('');
      setError('');
      setSuccess('');
      setSelectedType(progressTypes[0]);
    }
  }, [isOpen, progress, courseTitle]);

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleTypeChange = (typeId) => {
    const type = progressTypes.find(t => t.id === typeId);
    setSelectedType(type);
    // Update description with template if it hasn't been modified yet
    if (!description || description === selectedType.template(progress, courseTitle)) {
      setDescription(type.template(progress, courseTitle));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      
      // Enhance description with emoji and hashtags
      const finalDescription = `${selectedType.emoji} ${description || selectedType.template(progress, courseTitle)} #${courseCategory.replace(/\s+/g, '')}`;
      formData.append('description', finalDescription);
      
      if (file) {
        formData.append('media', file);
      } else {
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
        
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={150} 
          style={{ display: 'none' }}
        />
        
        <form onSubmit={handleSubmit}>
          <div className="progress-type-selector">
            <label>Progress Type:</label>
            <select 
              value={selectedType.id}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {progressTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={selectedType.template(progress, courseTitle)}
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
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl('');
                  }}
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