import React, { useState } from 'react';
import { addCourse } from '../../services/api';

const AddCourseForm = ({ onCourseAdded }) => {
  const [course, setCourse] = useState({
    title: '',
    description: '',
    modules: []
  });
  const [currentModule, setCurrentModule] = useState({
    title: '',
    description: '',
    videoLink: '',
    pdfLink: ''
  });
  const [error, setError] = useState(null);
  const [moduleCount, setModuleCount] = useState(0);

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    setCurrentModule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addModule = () => {
    if (!currentModule.title) {
      setError('Module title is required');
      return;
    }

    if (course.modules.length >= 10) {
      setError('Maximum 10 modules allowed per course');
      return;
    }

    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, { ...currentModule }]
    }));
    setCurrentModule({
      title: '',
      description: '',
      videoLink: '',
      pdfLink: ''
    });
    setModuleCount(prev => prev + 1);
    setError(null);
  };

  const removeModule = (index) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
    setModuleCount(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!course.title || !course.description) {
      setError('Course title and description are required');
      return;
    }

    if (course.modules.length === 0) {
      setError('At least one module is required');
      return;
    }

    try {
      const response = await addCourse(course);
      if (response.data) {
        setCourse({
          title: '',
          description: '',
          modules: []
        });
        setCurrentModule({
          title: '',
          description: '',
          videoLink: '',
          pdfLink: ''
        });
        setModuleCount(0);
        onCourseAdded(response.data);
        setError(null);
      }
    } catch (error) {
      console.error('Failed to add course:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add course. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className="add-course-form">
      <h2>Add New Course</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Course Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={course.title}
            onChange={handleCourseChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Course Description</label>
          <textarea
            id="description"
            name="description"
            value={course.description}
            onChange={handleCourseChange}
            required
          />
        </div>

        <div className="modules-section">
          <div className="modules-header">
            <h3>Modules</h3>
            <span className="module-counter">
              {moduleCount}/10 modules
            </span>
          </div>
          
          <div className="module-form">
            <div className="form-group">
              <label htmlFor="moduleTitle">Module Title *</label>
              <input
                type="text"
                id="moduleTitle"
                name="title"
                value={currentModule.title}
                onChange={handleModuleChange}
                placeholder="Enter module title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="moduleDescription">Module Description</label>
              <textarea
                id="moduleDescription"
                name="description"
                value={currentModule.description}
                onChange={handleModuleChange}
                placeholder="Enter module description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="videoLink">Video Link</label>
              <input
                type="url"
                id="videoLink"
                name="videoLink"
                value={currentModule.videoLink}
                onChange={handleModuleChange}
                placeholder="Enter video URL"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pdfLink">PDF Link</label>
              <input
                type="url"
                id="pdfLink"
                name="pdfLink"
                value={currentModule.pdfLink}
                onChange={handleModuleChange}
                placeholder="Enter PDF URL"
              />
            </div>

            <button 
              type="button" 
              onClick={addModule} 
              className="add-module-btn"
              disabled={moduleCount >= 10}
            >
              Add Module
            </button>
          </div>

          {course.modules.length > 0 && (
            <div className="modules-list">
              <h4>Added Modules ({course.modules.length})</h4>
              {course.modules.map((module, index) => (
                <div key={index} className="module-item">
                  <div className="module-header">
                    <h5>Module {index + 1}: {module.title}</h5>
                    <button
                      type="button"
                      onClick={() => removeModule(index)}
                      className="remove-module-btn"
                    >
                      Remove
                    </button>
                  </div>
                  <p>{module.description}</p>
                  {module.videoLink && (
                    <div className="module-link">
                      <strong>Video:</strong> <a href={module.videoLink} target="_blank" rel="noopener noreferrer">{module.videoLink}</a>
                    </div>
                  )}
                  {module.pdfLink && (
                    <div className="module-link">
                      <strong>PDF:</strong> <a href={module.pdfLink} target="_blank" rel="noopener noreferrer">{module.pdfLink}</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn">
          Add Course
        </button>
      </form>
    </div>
  );
};

export default AddCourseForm; 