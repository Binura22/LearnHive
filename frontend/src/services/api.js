// src/services/api.js

import axiosInstance from './axiosInstance';

// Login request
export const login = async (username, password) => {
  return axiosInstance.post('/login', { username, password });
};

// Get all courses (public)
export const getAllCourses = async () => {
  return axiosInstance.get('/api/public/courses');
};

// Admin course operations
export const addCourse = async (course) => {
  return axiosInstance.post('/api/admin/courses', course);
};

export const updateCourse = async (id, updatedCourse) => {
  return axiosInstance.put(`/api/admin/courses/${id}`, updatedCourse);
};

export const deleteCourse = async (id) => {
  return axiosInstance.delete(`/api/admin/courses/${id}`);
};

// Module operations
export const getModulesByCourseId = async (courseId) => {
  return axiosInstance.get(`/api/public/courses/${courseId}/modules`);
};

export const addModule = async (courseId, module) => {
  return axiosInstance.post(`/api/admin/courses/${courseId}/modules`, module);
};

export const updateModule = async (moduleId, updatedModule) => {
  return axiosInstance.put(`/api/admin/modules/${moduleId}`, updatedModule);
};

export const deleteModule = async (moduleId) => {
  return axiosInstance.delete(`/api/admin/modules/${moduleId}`);
};

// Admin dashboard
export const getAdminDashboard = async () => {
  return axiosInstance.get('/api/admin/dashboard');
};
