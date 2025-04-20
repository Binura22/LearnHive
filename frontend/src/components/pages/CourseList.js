import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses } from '../../services/api';
import './CourseList.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses();
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="course-list-container">
      <h1>Available Courses</h1>
      <div className="course-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            {course.imageUrl && (
              <img 
                src={course.imageUrl} 
                alt={course.title}
                className="course-image"
              />
            )}
            <h3>{course.title}</h3>
            {course.modules && (
              <div className="module-count">
                {course.modules.length} Modules
              </div>
            )}
            <button 
              className="view-course-btn"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              View Course
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;