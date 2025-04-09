import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../services/api';
import CourseList from './CourseList';
import AddCourseForm from '../forms/AddCourseForm';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminDashboard();
      if (response.data) {
        setCourses(response.data);
      } else {
        setError('No courses found');
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError(error.response?.data?.message || 'Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseAdded = (newCourse) => {
    setCourses(prev => [...prev, newCourse]);
    setShowAddForm(false);
  };

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
        <h2>Error</h2>
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-course-btn"
        >
          {showAddForm ? 'Cancel' : 'Add New Course'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-course-section">
          <AddCourseForm onCourseAdded={handleCourseAdded} />
        </div>
      )}

      <div className="courses-section">
        {courses.length === 0 ? (
          <p>No courses available. Add your first course!</p>
        ) : (
          <CourseList courses={courses} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;