import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses } from '../../../services/api';
import SearchBar from '../../common/SearchBar';
import './CourseList.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses();
        setCourses(response.data);
        setFilteredCourses(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleSearch = (searchTerm) => {
    if (searchTerm) {
      const filtered = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
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
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="course-list-container">
      <h1>Available Courses</h1>
      <div className="search-container">
        <SearchBar onSearch={handleSearch} placeholder="Search courses..." className="course-search"/>
      </div>
      {filteredCourses.length === 0 ? (
        <div className="no-results">
          <p>No courses found matching your search.</p>
        </div>
      ) : (
        <div className="course-grid">
          {filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              {course.imageUrl && (
                <img src={course.imageUrl} alt={course.title} className="course-image"/>
              )}
              <h3>{course.title}</h3>
              {course.modules && (
                <div className="module-count">
                  {course.modules.length} Modules
                </div>
              )}
              <button className="view-course-btn" onClick={() => navigate(`/courses/${course.id}`)}>
                View Course
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;