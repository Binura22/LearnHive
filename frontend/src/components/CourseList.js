// src/components/CourseList.js
import React from 'react';

const CourseList = ({ courses }) => {
  if (!courses || courses.length === 0) {
    return <p>No courses available.</p>;
  }

  return (
    <div className="course-list">
      <h2>Available Courses</h2>
      <div className="course-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            {course.modules && course.modules.length > 0 && (
              <div className="module-count">
                Modules: {course.modules.length}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;