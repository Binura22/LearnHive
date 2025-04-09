import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import Button from './Button';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/login', {
        username,
        password
      });
      
      if (response.data.authenticated) {
        navigate('/api/auth/check-role');
      }
    } catch (error) {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
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
        <Button type="submit" variant="primary" fullWidth>
          Login
        </Button>
      </form>
      <div className="oauth-container">
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          fullWidth
        >
          Login with Google
        </Button>
      </div>
    </div>
  );
};

export default Login; 