import React, { useEffect, useState } from 'react';
import { getUserById, updateProfile } from '../../../services/api';
import './EditProfilePage.css';

const EditProfilePage = () => {
  const email = localStorage.getItem('username');
  const userId = localStorage.getItem('userId');

  const [formData, setFormData] = useState({
    bio: '',
    profileImage: null,
    coverImage: null,
  });

  const [preview, setPreview] = useState({
    profileImage: '',
    coverImage: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUserById(userId);
        const { bio, profileImage, coverImage } = res.data;
        setFormData({ bio, profileImage: null, coverImage: null });
        setPreview({ profileImage, coverImage });
      } catch (err) {
        console.error('Failed to load user data:', err);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [name]: file }));
      setPreview(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateProfile(email, formData.bio, formData.profileImage, formData.coverImage);
      alert("Profile updated successfully!");
      window.location.href = `/profile/${userId}`;
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="profile-card">
        <h2>Edit Your Profile</h2>
        <form onSubmit={handleSubmit} className="edit-form" encType="multipart/form-data">
          <div className="cover-section">
            {preview.coverImage && <div className="cover-preview" style={{ backgroundImage: `url(${preview.coverImage})` }} />}
            <input type="file" name="coverImage" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="profile-section">
            {preview.profileImage && <img src={preview.profileImage} alt="Profile" className="profile-preview" />}
            <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} />
          </div>

          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us something about you..."
            className="bio-input"
          />

          <button type="submit" className="save-btn">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
