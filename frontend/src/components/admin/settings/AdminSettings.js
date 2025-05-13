import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance';
import BackButton from '../common/BackButton';
import './AdminSettings.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    maintenanceMode: false,
    allowRegistration: true,
    maxFileSize: 10,
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    emailNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/settings');
      setSettings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.put('/api/admin/settings', settings);
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError('Failed to update settings');
      console.error('Error updating settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-settings-loading">Loading settings...</div>;
  }

  return (
    <div className="admin-settings-container">
      <BackButton />
      <h1>Platform Settings</h1>

      {error && <div className="admin-settings-error">{error}</div>}
      {success && <div className="admin-settings-success">{success}</div>}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h2>General Settings</h2>
          
          <div className="form-group">
            <label htmlFor="siteName">Site Name</label>
            <input
              type="text"
              id="siteName"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="siteDescription">Site Description</label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              value={settings.siteDescription}
              onChange={handleChange}
              rows="4"
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>System Settings</h2>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
              />
              Maintenance Mode
            </label>
            <p className="setting-description">
              When enabled, only administrators can access the platform
            </p>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="allowRegistration"
                checked={settings.allowRegistration}
                onChange={handleChange}
              />
              Allow New Registrations
            </label>
            <p className="setting-description">
              When disabled, new users cannot register
            </p>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
              Enable Email Notifications
            </label>
            <p className="setting-description">
              Send email notifications for important events
            </p>
          </div>
        </div>

        <div className="settings-section">
          <h2>File Upload Settings</h2>
          
          <div className="form-group">
            <label htmlFor="maxFileSize">Maximum File Size (MB)</label>
            <input
              type="number"
              id="maxFileSize"
              name="maxFileSize"
              value={settings.maxFileSize}
              onChange={handleChange}
              min="1"
              max="100"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="save-settings-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings; 