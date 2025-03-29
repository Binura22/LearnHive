// src/components/CourseList.js
import React from 'react';

const CourseList = ({ courses }) => {
  return (
    <div>
      <h2>Courses</h2>
      <ul>
        {courses.map(course => (
          <li key={course.id}>
            <strong>{course.title}</strong>: {course.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseList;