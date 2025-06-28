import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses, deleteCourse } from '../../../services/api';
import SearchBar from '../../common/SearchBar';
import AddCourseForm from './AddCourseForm';
import BackButton from '../../common/BackButton';
import './AdminCourseList.css';

const AdminCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getAllCourses();
      setCourses(response.data);
      applyFilters('', selectedLevel, response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (searchTerm, levelFilter, coursesToFilter) => {
    let updatedFilteredCourses = coursesToFilter;

    if (levelFilter) {
      updatedFilteredCourses = updatedFilteredCourses.filter(course => course.level === levelFilter);
    }

    if (searchTerm) {
      updatedFilteredCourses = updatedFilteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(updatedFilteredCourses);
  };

  const handleSearch = (searchTerm) => {
    applyFilters(searchTerm, selectedLevel, courses);
  };

  const handleLevelChange = (e) => {
    const level = e.target.value;
    setSelectedLevel(level);
    const currentSearchTerm = document.querySelector('.course-search input')?.value || '';
    applyFilters(currentSearchTerm, level, courses);
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
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      }
    }
  };

  const handleCourseAdded = (newCourse) => {
    const updated = [...courses, newCourse];
    setCourses(updated);
    setFilteredCourses(updated);
    setShowAddCourse(false);
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="admin-course-list">
      <div className="header">
        <BackButton />
        <h1>Manage Courses</h1>
        <button className="add-course-btn" onClick={() => setShowAddCourse(true)}>
          Add New Course
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      <div className="search-container">
        <div className="search-filter-area">
          <SearchBar onSearch={handleSearch} placeholder="Search courses..." className="course-search"/>
          <div className="filter-container">
            <label htmlFor="level-filter">Filter by Level:</label>
            <select id="level-filter" value={selectedLevel} onChange={handleLevelChange}>
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>
      {filteredCourses.length === 0 ? (
        <div className="no-results">
          <p>No courses found matching your search.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
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
      )}

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