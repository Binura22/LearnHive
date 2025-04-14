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

export const getCourseById = async (id) => {
  return axiosInstance.get(`/api/admin/courses/${id}`);
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

export const addModule = async (courseId, moduleData, videoFile, pdfFile) => {
  try {
    const formData = new FormData();
    formData.append('module', new Blob([JSON.stringify(moduleData)], { type: 'application/json' }));
    if (videoFile) {
      formData.append('video', videoFile);
    }
    if (pdfFile) {
      formData.append('pdf', pdfFile);
    }
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    return fileUploadInstance.post(`/api/admin/courses/${courseId}/modules`, formData, config);
  } catch (error) {
    console.error('Error in addModule:', error);
    throw error;
  }
};



export const updateModule = async (moduleId, formData) => {
  return fileUploadInstance.put(`/api/admin/modules/${moduleId}`, formData);
};

export const deleteModule = async (id) => {
  return axiosInstance.delete(`/api/admin/modules/${id}`);
};

// Admin dashboard
export const getAdminDashboard = async () => {
  return axiosInstance.get('/api/admin/dashboard');
};
