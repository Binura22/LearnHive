import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, updateCourse, updateModule, uploadCourseImage, deleteModule } from '../../services/api';
import './EditCourseForm.css';

// Module class to ensure consistent data structure
class Module {
  constructor({ id, courseId, title, description, orderIndex, videoLink, pdfLink }) {
    this.id = id;
    this.courseId = courseId;
    this.title = title;
    this.description = description;
    this.orderIndex = typeof orderIndex === 'number' ? orderIndex : 0;
    this.videoLink = videoLink;
    this.pdfLink = pdfLink;
  }

  toJSON() {
    return {
      id: this.id,
      courseId: this.courseId,
      title: this.title,
      description: this.description,
      orderIndex: this.orderIndex,
      videoLink: this.videoLink,
      pdfLink: this.pdfLink
    };
  }
}

const EditCourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Course state
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    duration: 0,
    level: 'beginner',
    category: '',
    published: false,
    imageUrl: ''
  });
  const [courseImage, setCourseImage] = useState(null);

  // Modules state
  const [modules, setModules] = useState([]);
  const [moduleFiles, setModuleFiles] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCourseById(courseId);
        const courseData = response.data;
        setCourseData(courseData);
        
        // Ensure modules have orderIndex set
        const modulesWithOrder = (courseData.modules || []).map((module, index) => ({
          ...module,
          orderIndex: typeof module.orderIndex === 'number' ? module.orderIndex : index
        }));
        setModules(modulesWithOrder);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

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
    
    if (type === 'file') {
      // Store file in a separate state to handle file uploads
      setModuleFiles(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          [name]: e.target.files[0]
        }
      }));
    } else {
      // Update the module data while preserving existing values
      setModules(prev => {
        const updated = [...prev];
        const currentModule = updated[index];
        updated[index] = {
          ...currentModule,
          [name]: value,
          orderIndex: currentModule.orderIndex || index // Preserve existing orderIndex or use index
        };
        return updated;
      });
    }
  };

  const handleDeleteModule = async (moduleId, index) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await deleteModule(moduleId);
        setModules(prev => prev.filter((_, i) => i !== index));
        // Update orderIndex for remaining modules
        setModules(prev => prev.map((module, i) => ({
          ...module,
          orderIndex: i
        })));
      } catch (err) {
        setError('Failed to delete module: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // First update the course
      const updatedCourse = await updateCourse(courseId, courseData);

      // Then handle course image if it exists
      if (courseImage) {
        const formData = new FormData();
        formData.append('file', courseImage);
        await uploadCourseImage(courseId, formData);
      }

      // Then update each module
      for (const [index, module] of modules.entries()) {
        if (!module.id) continue; // Skip modules without an ID

        const files = moduleFiles[index] || {};
        try {
          const formData = new FormData();

          // Create module data with preserved orderIndex
          const moduleData = {
            id: module.id,
            courseId: courseId,
            title: module.title?.trim() || '',
            description: module.description?.trim() || '',
            orderIndex: typeof module.orderIndex === 'number' ? module.orderIndex : index,
            videoLink: module.videoLink || '',
            pdfLink: module.pdfLink || ''
          };
          
          console.log(`Updating module ${module.id} with data:`, moduleData);
          
          // Add module data as JSON
          formData.append('module', new Blob([JSON.stringify(moduleData)], { 
            type: 'application/json' 
          }));

          // Add files if they exist
          if (files.videoFile) {
            formData.append('video', files.videoFile);
          }
          if (files.pdfFile) {
            formData.append('pdf', files.pdfFile);
          }

          // Update the module
          const response = await updateModule(module.id, formData);
          console.log(`Module ${module.id} update response:`, response);

          // Update the local state with the response data
          setModules(prev => prev.map((m, i) => 
            i === index ? { ...response.data || response } : m
          ));
        } catch (err) {
          console.error(`Error updating module ${module.id}:`, err);
          throw new Error(`Failed to update module ${index + 1}: ${err.message}`);
        }
      }

      setIsLoading(false);
      navigate('/admin/courses');
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err.message || 'Failed to update course');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-course-container">
      <h2>Edit Course</h2>
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
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={courseData.category}
              onChange={handleCourseChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="courseImage">Course Image</label>
            {courseData.imageUrl && (
              <img 
                src={courseData.imageUrl} 
                alt="Course thumbnail" 
                className="course-thumbnail"
              />
            )}
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
          
          {modules.map((module, index) => (
            <div key={module.id || index} className="module-container">
              <div className="module-header">
                <h4>Module {index + 1}</h4>
                {module.id && (
                  <button
                    type="button"
                    className="delete-module-btn"
                    onClick={() => handleDeleteModule(module.id, index)}
                  >
                    Delete Module
                  </button>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor={`module-title-${index}`}>Title</label>
                <input
                  type="text"
                  id={`module-title-${index}`}
                  name="title"
                  value={module.title || ''}
                  onChange={(e) => handleModuleChange(index, e)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`module-description-${index}`}>Description</label>
                <textarea
                  id={`module-description-${index}`}
                  name="description"
                  value={module.description || ''}
                  onChange={(e) => handleModuleChange(index, e)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`module-video-${index}`}>Video</label>
                {module.videoLink && (
                  <div className="current-file">
                    Current: <a href={module.videoLink} target="_blank" rel="noopener noreferrer">View Video</a>
                  </div>
                )}
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
                {module.pdfLink && (
                  <div className="current-file">
                    Current: <a href={module.pdfLink} target="_blank" rel="noopener noreferrer">View PDF</a>
                  </div>
                )}
                <input
                  type="file"
                  id={`module-pdf-${index}`}
                  name="pdfFile"
                  onChange={(e) => handleModuleChange(index, e)}
                  accept=".pdf"
                />
              </div>
            </div>
          ))}
        </section>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/admin/courses')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourseForm;
