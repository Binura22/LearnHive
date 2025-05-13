import axiosInstance, { fileUploadInstance } from './axiosInstance';
import axios from 'axios';

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
  return axiosInstance.get(`/api/courses/${id}`);
};

export const getPublishedCourses = async () => {
  return axiosInstance.get('/api/public/courses/published');
};

// Admin course operations
export const addCourse = async (courseData) => {
  return axiosInstance.post('/api/courses', courseData);
};

export const getAdminCourses = async () => {
  return axiosInstance.get('/api/admin/courses');
};

export const updateCourse = async (id, updatedCourse) => {
  return axiosInstance.put(`/api/courses/${id}`, updatedCourse);
};

export const deleteCourse = async (id) => {
  return axiosInstance.delete(`/api/courses/${id}`);
};

export const uploadCourseImage = async (courseId, imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  return fileUploadInstance.post(`/api/courses/${courseId}/image`, formData);
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
    
    return fileUploadInstance.post(`/api/courses/${courseId}/modules`, formData, config);
  } catch (error) {
    console.error('Error in addModule:', error);
    throw error;
  }
};

export const updateModule = async (moduleId, formData) => {
  return fileUploadInstance.put(`/api/courses/modules/${moduleId}`, formData);
};

export const deleteModule = async (id) => {
  return axiosInstance.delete(`/api/courses/modules/${id}`);
};

// Admin dashboard
export const getAdminDashboard = async () => {
  return axiosInstance.get('/api/dashboard');
};

// Get a user by ID
export const getUserById = async (userId) => {
  const response = await axios.get(`http://localhost:8080/api/users/${userId}`, {
    withCredentials: true,
  });
  return response;
};

// Update profile with optional images
export const updateProfile = async (email, bio, profileImage, coverImage) => {
  const formData = new FormData();
  formData.append('email', email);
  if (bio) formData.append('bio', bio);
  if (profileImage) formData.append('profileImage', profileImage);
  if (coverImage) formData.append('coverImage', coverImage);

  return fileUploadInstance.put('/api/users/update', formData);
};

// Follow another user
export const followUser = async (userId, targetUserId) => {
  return axiosInstance.post(`/api/interactions/follow`, { userId, targetUserId });
};

// Unfollow another user
export const unfollowUser = async (userId, targetUserId) => {
  return axiosInstance.delete(`/api/interactions/follow`, { 
    data: {userId, targetUserId }
  });
};

// Get followers
export const getFollowers = async (userId) => {
  return axiosInstance.get(`/api/interactions/${userId}/followers`);
};

// Get following
export const getFollowing = async (userId) => {
  return axiosInstance.get(`/api/interactions/${userId}/following`);
};

// Learning Plan operations
export const createLearningPlan = async (learningPlanData) => {
  return axiosInstance.post('/api/learning-plans', learningPlanData);
};

export const getLearningPlansByUserId = async (userId) => {
  return axiosInstance.get(`/api/learning-plans/${userId}`);
};

export const getLearningPlanById = async (id) => {
  return axiosInstance.get(`/api/learning-plans/plan/${id}`);
};

export const updateLearningPlan = async (learningPlanId, updatedData) => {
  return axiosInstance.put(`/api/learning-plans/${learningPlanId}`, updatedData);
};

export const deleteLearningPlan = async (learningPlanId) => {
  return axiosInstance.delete(`/api/learning-plans/${learningPlanId}`);
};

export const getAdminLearningPlans = async () => {
  return axiosInstance.get('/api/admin/learning-plans');
};


