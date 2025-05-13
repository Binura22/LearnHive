import React, { useState, useRef, useEffect } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
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
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

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
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type and size
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG)');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image must be smaller than 5MB');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleRemoveMedia = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleTypeChange = (typeId) => {
    const type = progressTypes.find(t => t.id === typeId);
    setSelectedType(type);
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
          
          <div 
            className={`file-upload-container ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!previewUrl ? triggerFileInput : null}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {!previewUrl ? (
              <div className="upload-prompt">
                <FiUpload className="upload-icon" />
                <p>Drag & drop a photo here or click to browse</p>
                <span className="upload-hint">(Optional - Max 5MB)</span>
              </div>
            ) : (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Preview" className="preview-image" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={handleRemoveMedia}
                  aria-label="Remove image"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Share Progress</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgressShareModal;