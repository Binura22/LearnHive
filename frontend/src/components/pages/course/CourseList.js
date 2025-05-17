import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses } from '../../../services/api';
import SearchBar from '../../common/SearchBar';
import './CourseList.css';

const CourseList = () => {
  // React state declarations
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState(''); // State for selected level

  useEffect(() => {
    // Fetch courses from backend
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses();

        // Filter courses where published = true
        const publishedCourses = response.data.filter(course => course.published === true);

        // Set courses and filteredCourses
        setCourses(publishedCourses);
        // Apply initial filter (all levels)
        applyFilters('', selectedLevel, publishedCourses);
        setLoading(false);
      } catch (error) {
        // Handle errors
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []); // No dependency on selectedLevel here

  // Function to apply both search and level filters
  const applyFilters = (searchTerm, levelFilter, coursesToFilter) => {
      let updatedFilteredCourses = coursesToFilter;

      // Apply level filter first
      if (levelFilter) {
          updatedFilteredCourses = updatedFilteredCourses.filter(course => course.level === levelFilter);
      }

      // Apply search term
      if (searchTerm) {
          updatedFilteredCourses = updatedFilteredCourses.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
      }

      setFilteredCourses(updatedFilteredCourses);
  };

  // Handle search input from SearchBar
  const handleSearch = (searchTerm) => {
    // Use the current selected level when searching
    applyFilters(searchTerm, selectedLevel, courses);
  };

  // Handle level filter change
  const handleLevelChange = (e) => {
    const level = e.target.value;
    setSelectedLevel(level);
    // Apply both search and level filters
    const currentSearchTerm = document.querySelector('.course-search input')?.value || ''; // Get current search term
    applyFilters(currentSearchTerm, level, courses);
  };

  // Show loading UI while fetching data
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  // Show error UI if data fetch fails
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Render course list UI
  return (
    <div className="course-list-container">
      <div className="search-container">
        <div><h1>Available Courses</h1></div>
        <div className="search-filter-area">
          <SearchBar onSearch={handleSearch} placeholder="Search courses..." className="course-search" />
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
        // Display message if no courses match the search
        <div className="no-results">
          <p>No courses found matching your search.</p>
        </div>
      ) : (
        <div className="course-grid">
          {filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              {course.imageUrl && (
                <img src={course.imageUrl} alt={course.title} className="course-image" />
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
