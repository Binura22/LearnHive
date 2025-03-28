import React, { useEffect, useState } from 'react';
import { fetchCourses } from '../services/api';

const CourseList = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await fetchCourses();
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    getCourses();
  }, []);

  return (
    <div>
      <h2>Course List</h2>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            <strong>{course.title}</strong>: {course.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseList;