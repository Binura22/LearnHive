import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses, deleteCourse } from '../../services/api';
import AddCourseForm from './AddCourseForm';
import './AdminCourseList.css';

const AdminCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getAllCourses();
      setCourses(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
      } catch (err) {
        console.error('Delete error:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to delete course';
        setError(`Failed to delete course: ${errorMessage}`);
        
        // after unauthorized, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      }
    }
  };

  const handleCourseAdded = (newCourse) => {
    setCourses([...courses, newCourse]);
    setShowAddCourse(false);
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="admin-course-list">
      <div className="header">
        <h1>Manage Courses</h1>
        <button className="add-course-btn" onClick={() => setShowAddCourse(true)}>
          Add New Course
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="courses-grid">
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
            <div className="course-actions">
              <button 
                className="edit-btn"
                onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
              >
                Edit
              </button>
              <button 
                className="delete-btn"
                onClick={() => handleDeleteCourse(course.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddCourse && (
        <AddCourseForm
          onClose={() => setShowAddCourse(false)}
          onCourseAdded={handleCourseAdded}
        />
      )}
    </div>
  );
};

export default AdminCourseList; 