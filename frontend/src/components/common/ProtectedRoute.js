import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';

/**
 * ProtectedRoute component that checks if the user has the required role
 * before allowing access to the wrapped component
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await axiosInstance.get('/api/auth/check-role');
        const { authenticated, roles, isAdmin } = response.data;
        
        // Check if the user is an admin when the required role is ADMIN
        if (authenticated && requiredRole === 'ADMIN') {
          // Handle both direct isAdmin flag and roles array
          if (isAdmin === true) {
            setIsAuthorized(true);
          } else if (roles && Array.isArray(roles)) {
            // Check for both 'ADMIN' and 'ROLE_ADMIN' in the roles array
            const hasAdminRole = roles.some(role => 
              role === 'ADMIN' || role === 'ROLE_ADMIN'
            );
            setIsAuthorized(hasAdminRole);
          } else {
            setIsAuthorized(false);
          }
        } else if (authenticated && roles && Array.isArray(roles)) {
          // For other roles, check if the required role is in the roles array
          const hasRole = roles.some(role => 
            role === requiredRole || role === `ROLE_${requiredRole}`
          );
          setIsAuthorized(hasRole);
        } else {
          setIsAuthorized(false);
        }
        
        console.log('Auth check result:', { 
          requiredRole, 
          isAdmin: response.data.isAdmin, 
          roles: response.data.roles,
          isAuthorized: isAuthorized
        });
      } catch (error) {
        console.error('Authorization check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [requiredRole]); // Don't include isAuthorized to avoid infinite loop

  if (isLoading) {
    return <div className="loading">Checking authorization...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
