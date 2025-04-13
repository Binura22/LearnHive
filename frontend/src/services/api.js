// src/services/api.js

import axiosInstance, { fileUploadInstance } from './axiosInstance';

// Login request
export const login = async (username, password) => {
  return axiosInstance.post('/api/auth/login', { username, password });
};

// Logout request
export const logout = async () => {
  return axiosInstance.post('/api/auth/logout');
};

// Course operations (public)
export const getAllCourses = async () => {
  return axiosInstance.get('/api/public/courses');
};

export const getPublishedCourses = async () => {
  return axiosInstance.get('/api/public/courses/published');
};

// Admin course operations
export const addCourse = async (courseData) => {
  return axiosInstance.post('/api/admin/courses', courseData);
};

export const updateCourse = async (id, updatedCourse) => {
  return axiosInstance.put(`/api/admin/courses/${id}`, updatedCourse);
};

export const deleteCourse = async (id) => {
  return axiosInstance.delete(`/api/admin/courses/${id}`);
};

export const uploadCourseImage = async (courseId, imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  return fileUploadInstance.post(`/api/admin/courses/${courseId}/image`, formData);
};

// Module operations
export const getModulesByCourseId = async (courseId) => {
  return axiosInstance.get(`/api/public/courses/${courseId}/modules`);
};

export const addModule = async (courseId, moduleData) => {
  return axiosInstance.post(`/api/admin/courses/${courseId}/modules`, moduleData);
};

export const uploadModuleFiles = async (moduleId, { videoFile, pdfFile }) => {
  const formData = new FormData();
  if (videoFile) {
    formData.append('video', videoFile);
  }
  if (pdfFile) {
    formData.append('pdf', pdfFile);
  }
  return fileUploadInstance.post(`/api/admin/modules/${moduleId}/files`, formData);
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
