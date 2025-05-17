import React, { useState } from 'react';
import { addCourse, addModule, uploadCourseImage } from '../../../services/api';
import './AddCourseForm.css';

const AddCourseForm = ({ onClose, onCourseAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [moduleError, setModuleError] = useState('');
  
  // Course state
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    duration: 0,
    level: 'beginner',
    category: '',
    published: false
  });
  const [courseImage, setCourseImage] = useState(null);

  // Modules state
  const [modules, setModules] = useState([{
    title: '',
    description: '',
    videoFile: null,
    pdfFile: null,
    orderIndex: 0
  }]);

  const handleCourseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCourseImageChange = (e) => {
    if (e.target.files?.[0]) {
      setCourseImage(e.target.files[0]);
    }
  };

  const handleModuleChange = (index, e) => {
    const { name, value, type } = e.target;
    setModules(prev => {
      const updated = [...prev];
      if (type === 'file') {
        updated[index] = {
          ...updated[index],
          [name]: e.target.files[0]
        };
      } else {
        updated[index] = {
          ...updated[index],
          [name]: value
        };
      }
      return updated;
    });
  };

  const addNewModule = () => {
    if (modules.length >= 10) {
      setModuleError('Maximum 10 modules per course allowed.');
      return;
    }
    setModules(prev => [
      ...prev,
      {
        title: '',
        description: '',
        videoFile: null,
        pdfFile: null,
        orderIndex: prev.length
      }
    ]);
    setModuleError('');
  };

  const removeModule = (index) => {
    if (modules.length <= 1) {
      setModuleError('At least 1 module is required.');
      return;
    }
    setModules(prev => prev.filter((_, i) => i !== index));
    setModuleError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setModuleError('');

    if (modules.length < 1) {
      setModuleError('At least 1 module is required.');
      setIsLoading(false);
      return;
    }

    // Each module has both a video and a PDF
    for (const [index, module] of modules.entries()) {
      if (!module.videoFile || module.videoFile.length === 0 || !module.pdfFile || module.pdfFile.length === 0) {
        setModuleError(`Module ${index + 1} requires both a video and a PDF file.`);
        setIsLoading(false);
        return;
      }
    }

    try {
      // Create the course
      const courseResponse = await addCourse(courseData);
      const courseId = courseResponse.data.id;

      // Upload course image if exists
      if (courseImage) {
        await uploadCourseImage(courseId, courseImage);
      }

      // Create modules with their files
      for (const module of modules) {
        await addModule(
          courseId,
          {
            title: module.title,
            description: module.description,
            orderIndex: module.orderIndex
          },
          module.videoFile,
          module.pdfFile
        );
      }

      onCourseAdded(courseResponse.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Add New Course</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Course Details Section */}
          <section className="course-details">
            <h3>Course Details</h3>
            
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={courseData.title}
                onChange={handleCourseChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={courseData.description}
                onChange={handleCourseChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={courseData.category}
                onChange={handleCourseChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Programming">Programming</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (hours)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={courseData.duration}
                onChange={handleCourseChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="level">Level</label>
              <select
                id="level"
                name="level"
                value={courseData.level}
                onChange={handleCourseChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="courseImage">Course Image</label>
              <input
                type="file"
                id="courseImage"
                name="courseImage"
                onChange={handleCourseImageChange}
                accept="image/*"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="published"
                  checked={courseData.published}
                  onChange={handleCourseChange}
                />
                Publish course
              </label>
            </div>
          </section>

          {/* Modules Section */}
          <section className="modules-section">
            <h3>Course Modules</h3>
            {moduleError && <div className="error-message">{moduleError}</div>}
            {modules.map((module, index) => (
              <div key={index} className="module-container">
                <h4>Module {index + 1}</h4>
                
                <div className="form-group">
                  <label htmlFor={`module-title-${index}`}>Title</label>
                  <input
                    type="text"
                    id={`module-title-${index}`}
                    name="title"
                    value={module.title}
                    onChange={(e) => handleModuleChange(index, e)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`module-description-${index}`}>Description</label>
                  <textarea
                    id={`module-description-${index}`}
                    name="description"
                    value={module.description}
                    onChange={(e) => handleModuleChange(index, e)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`module-video-${index}`}>Video</label>
                  <input
                    type="file"
                    id={`module-video-${index}`}
                    name="videoFile"
                    onChange={(e) => handleModuleChange(index, e)}
                    accept="video/*"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`module-pdf-${index}`}>PDF</label>
                  <input
                    type="file"
                    id={`module-pdf-${index}`}
                    name="pdfFile"
                    onChange={(e) => handleModuleChange(index, e)}
                    accept=".pdf"
                  />
                </div>

                {modules.length > 1 && (
                  <button
                    type="button"
                    className="remove-module-btn"
                    onClick={() => removeModule(index)}
                    disabled={modules.length <= 1}
                  >
                    Remove Module
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="add-module-btn"
              onClick={addNewModule}
              disabled={modules.length >= 10}
            >
              Add Module
            </button>
            {modules.length >= 10 && (
              <div className="info-message">Maximum 10 modules allowed per course.</div>
            )}
          </section>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Course...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseForm; 