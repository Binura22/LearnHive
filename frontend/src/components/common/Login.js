import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/api/auth/check-role');
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleGithubLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/github';
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome to LearnHive</h2>
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

        <div className="oauth-container">
          <p className="oauth-divider">Or login with</p>
          <button onClick={handleGoogleLogin} className="oauth-button google">
            <img src="/google-icon.png" alt="Google" className="oauth-icon" />
            Continue with Google
          </button>
          <button onClick={handleGithubLogin} className="oauth-button github">
            <img src="/github-icon.png" alt="GitHub" className="oauth-icon" />
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 