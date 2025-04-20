import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById, getFollowers, getFollowing, followUser, unfollowUser } from '../../services/api';
import './ProfilePage.css'; // Optional if styling separately

const ProfilePage = () => {
  const { userId } = useParams(); // Dynamic route param
  const loggedInEmail = localStorage.getItem('username');
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await getUserById(userId);
      setProfile(res.data);
      console.log(res.data)
      const [followerRes, followingRes] = await Promise.all([
        getFollowers(userId),
        getFollowing(userId),
      ]);
      setFollowers(followerRes.data);
      setFollowing(followingRes.data);

      const isUserFollowing = followerRes.data.some(user => user.email === loggedInEmail);
      setIsFollowing(isUserFollowing);

    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleFollowToggle = async () => {
    const loggedInUserId = localStorage.getItem('userId');
    try {
      if (isFollowing) {
        await unfollowUser(loggedInUserId, userId);
      } else {
        await followUser(loggedInUserId, userId);
      }
      setIsFollowing(!isFollowing);
      fetchProfile(); // Refresh counts
    } catch (err) {
      console.error('Follow/unfollow failed:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  if (!profile) return <div>Loading profile...</div>;

  const isOwnProfile = profile.email === loggedInEmail;

  return (
    <div className="profile-page">
      <div className="cover-image" style={{ backgroundImage: `url(${profile.coverImage || '/default-cover.jpg'})` }} />

      <div className="profile-details">
        <img className="profile-pic" src={profile.profileImage || '/default-profile.png'} alt="Profile" />

        <h2>{profile.name}</h2>
        <p className="bio">{profile.bio || "No bio yet."}</p>

        <div className="follow-stats">
          <span>{followers.length} Followers</span>
          <span>{following.length} Following</span>
        </div>

        {!isOwnProfile && (
          <button onClick={handleFollowToggle} className="follow-btn">
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
