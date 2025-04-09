import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';

const AuthCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('/api/auth/check-role');
        const data = response.data;
        
        if (data.authenticated) {
          // Navigate based on role
          navigate(data.redirectUrl);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  return <div>Checking authentication...</div>;
};

export default AuthCheck; 