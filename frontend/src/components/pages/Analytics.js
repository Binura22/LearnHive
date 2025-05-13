import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import './Analytics.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    axiosInstance.get('/api/admin/analytics')
      .then(response => setAnalytics(response.data))
      .catch(() => setAnalytics({})); // fallback if needed
  }, []);

  if (!analytics) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <h1>User Analytics</h1>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Users</h3>
          <div className="analytics-value">{analytics.totalUsers}</div>
        </div>

        <div className="analytics-card">
          <h3>Admin Users</h3>
          <div className="analytics-value">{analytics.adminUsers}</div>
        </div>

        <div className="analytics-card">
          <h3>Normal Users</h3>
          <div className="analytics-value">{analytics.normalUsers}</div>
        </div>
      </div>

      <div className="analytics-section">
        <h2>Users by Provider</h2>
        <div className="provider-stats">
          {Object.entries(analytics.usersByProvider || {}).map(([provider, count]) => (
            <div key={provider} className="provider-card">
              <h3>{provider}</h3>
              <div className="analytics-value">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
