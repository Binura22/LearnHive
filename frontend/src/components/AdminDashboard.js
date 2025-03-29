import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../services/api';
import CourseList from './CourseList';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getAdminDashboard();
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <CourseList courses={courses} />
    </div>
  );
};

export default AdminDashboard;