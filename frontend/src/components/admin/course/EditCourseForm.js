import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCourseById,
  updateCourse,
  updateModule,
  uploadCourseImage,
  deleteModule
} from '../../../services/api';
import './EditCourseForm.css';

// Module class for creating and serializing module objects
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

  // State for loading status and errors
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

  // Module-related state
  const [modules, setModules] = useState([]);
  const [moduleFiles, setModuleFiles] = useState({});
  const [moduleError, setModuleError] = useState('');

  // Fetch course details when component mounts
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await getCourseById(courseId);
        setCourseData(data);

        // Ensure orderIndex is defined and consistent
        const modulesWithOrder = (data.modules || []).map((module, index) => ({
          ...module,
          orderIndex: typeof module.orderIndex === 'number' ? module.orderIndex : index
        }));
        setModules(modulesWithOrder);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Handle input changes for the course form
  const handleCourseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image file selection
  const handleCourseImageChange = (e) => {
    if (e.target.files?.[0]) {
      setCourseImage(e.target.files[0]);
    }
  };

  // Handle input/file changes for a specific module
  const handleModuleChange = (index, e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setModuleFiles(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          [name]: files[0]
        }
      }));
    } else {
      setModules(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [name]: value,
          orderIndex: updated[index].orderIndex ?? index
        };
        return updated;
      });
    }
  };

  // Handle deleting a module
  const handleDeleteModule = async (moduleId, index) => {
    if (modules.length <= 1) {
      setModuleError('At least 1 module is required.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await deleteModule(moduleId);
        const updatedModules = modules.filter((_, i) => i !== index).map((mod, i) => ({
          ...mod,
          orderIndex: i
        }));
        setModules(updatedModules);
        setModuleError('');
      } catch (err) {
        setError('Failed to delete module: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  // Handle form submission to update course and modules
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await updateCourse(courseId, courseData);

      // Upload new course image if selected
      if (courseImage) {
        await uploadCourseImage(courseId, courseImage);
      }

      // Loop through and update each module
      for (const [index, module] of modules.entries()) {
        if (!module.id) continue;

        const files = moduleFiles[index] || {};
        const formData = new FormData();

        const moduleData = new Module({
          id: module.id,
          courseId,
          title: module.title?.trim() || '',
          description: module.description?.trim() || '',
          orderIndex: module.orderIndex ?? index,
          videoLink: module.videoLink || '',
          pdfLink: module.pdfLink || ''
        });

        formData.append('module', JSON.stringify(moduleData.toJSON()));
        if (files.videoFile) formData.append('video', files.videoFile);
        if (files.pdfFile) formData.append('pdf', files.pdfFile);

        const response = await updateModule(module.id, formData);

        setModules(prev => prev.map((m, i) => i === index ? response.data : m));
      }

      navigate('/admin/courses');
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err.message || 'Failed to update course');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while fetching
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="edit-course-container">
      <h2>Edit Course</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Course details form */}
        <section className="course-details">
          <h3>Course Details</h3>

          {/* Title */}
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

          {/* Description */}
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

          {/* Duration */}
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

          {/* Level */}
          <div className="form-group">
            <label htmlFor="level">Level</label>
            <select id="level" name="level" value={courseData.level} onChange={handleCourseChange}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Category */}
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

          {/* Course Image */}
          <div className="form-group">
            <label htmlFor="courseImage">Course Image</label>
            {courseData.imageUrl && (
              <img src={courseData.imageUrl} alt="Course thumbnail" className="course-thumbnail" />
            )}
            <input
              type="file"
              id="courseImage"
              name="courseImage"
              onChange={handleCourseImageChange}
              accept="image/*"
            />
          </div>

          {/* Publish toggle */}
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

        {/* Modules list */}
        <section className="modules-section">
          <h3>Course Modules</h3>
          {moduleError && <div className="error-message">{moduleError}</div>}
          {modules.map((module, index) => (
            <div key={module.id || index} className="module-container">
              <div className="module-header">
                <h4>Module {index + 1}</h4>
                {module.id && (
                  <button
                    type="button"
                    className="delete-module-btn"
                    onClick={() => handleDeleteModule(module.id, index)}
                    disabled={modules.length <= 1}
                  >
                    Delete Module
                  </button>
                )}
              </div>

              {/* Module Title */}
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

              {/* Module Description */}
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

              {/* Module Video */}
              <div className="form-group">
                <label htmlFor={`videoFile-${index}`}>Video</label>
                {module.videoLink && (
                  <div className="current-file">
                    Current: <a href={module.videoLink} target="_blank" rel="noopener noreferrer">View Video</a>
                  </div>
                )}
                <input
                  type="file"
                  id={`videoFile-${index}`}
                  name="videoFile"
                  onChange={(e) => handleModuleChange(index, e)}
                  accept="video/*"
                />
              </div>

              {/* Module PDF */}
              <div className="form-group">
                <label htmlFor={`pdfFile-${index}`}>PDF</label>
                {module.pdfLink && (
                  <div className="current-file">
                    Current: <a href={module.pdfLink} target="_blank" rel="noopener noreferrer">View PDF</a>
                  </div>
                )}
                <input
                  type="file"
                  id={`pdfFile-${index}`}
                  name="pdfFile"
                  onChange={(e) => handleModuleChange(index, e)}
                  accept="application/pdf"
                />
              </div>
            </div>
          ))}
        </section>

        <button type="submit" className="submit-btn">Update Course</button>
      </form>
    </div>
  );
};

export default EditCourseForm;
