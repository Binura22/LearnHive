// src/components/Login.js

import React, { useState } from 'react';
import { login } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await login(username, password);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      // Check if user is admin
      if (response.data.roles?.includes('ROLE_ADMIN')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to the correct OAuth2 endpoint
    window.location.href = "http://localhost:8080/login/admin/dashboard";
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>

      <div className="oauth-separator">
        <span>OR</span>
      </div>

      <button 
        onClick={handleGoogleLogin} 
        className="google-login-button"
      >
        Login with Google
      </button>
    </div>
  );
};

export default Login;
