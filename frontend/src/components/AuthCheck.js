import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/check-role', {
          credentials: 'include'
        });
        const data = await response.json();
        
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