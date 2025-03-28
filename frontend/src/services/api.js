import axios from 'axios';

const BASE_URL = 'http://localhost:8081'; // Replace with your backend URL

export const login = (username, password) => {
  const base64Credentials = btoa(`${username}:${password}`);
  return axios.get(`${BASE_URL}/login`, {
    headers: {
      Authorization: `Basic ${base64Credentials}`,
    },
  });
};

export const fetchCourses = () => {
  return axios.get(`${BASE_URL}/api/public/courses`);
};

export const addCourse = (courseData, token) => {
  return axios.post(`${BASE_URL}/api/admin/courses`, courseData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateCourse = (id, courseData, token) => {
  return axios.put(`${BASE_URL}/api/admin/courses/${id}`, courseData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteCourse = (id, token) => {
  return axios.delete(`${BASE_URL}/api/admin/courses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};