import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getUserById,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
} from "../../../services/api";
import PostList from "../../common/PostList";
import "./ProfilePage.css";
import UserListModal from "../../common/UserListModal";

const ProfilePage = () => {
  const { userId } = useParams();
  const loggedInUserId = localStorage.getItem("userId");
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);


  const fetchProfile = async () => {
    try {
      const res = await getUserById(userId);
      setProfile(res.data);
      console.log(res.data);

      const [followerRes, followingRes] = await Promise.all([
        getFollowers(userId),
        getFollowing(userId),
      ]);
      setFollowers(followerRes.data);
      setFollowing(followingRes.data);
      console.log("followersres", followerRes.data)
      const isUserFollowing = followerRes.data.some(
        (user) => user.id === loggedInUserId
      );
      setIsFollowing(isUserFollowing);
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };
  console.log("Profile ", profile)
  console.log("Followers", followers)
  console.log("followings", following)
  const handleFollowToggle = async () => {
    const loggedInUserId = localStorage.getItem("userId");
    try {
      if (isFollowing) {
        await unfollowUser(loggedInUserId, userId);
      } else {
        await followUser(loggedInUserId, userId);
      }
      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  if (!profile) return <div>Loading profile...</div>;

  const isOwnProfile = profile.id === loggedInUserId;

  return (
    <div className="profile-page">
      <div
        className="cover-image"
        style={{
          backgroundImage: `url(${profile.coverImage || "/default-cover.jpg"})`,
        }}
      />

      <div className="profile-details">
        <img
          className="profile-pic"
          src={profile.profileImage || "/default-profile.png"}
          alt="Profile"
        />

        <h2>{profile.name}</h2>
        <p className="bio">{profile.bio || "No bio yet."}</p>

        <div className="follow-stats">
          <button className="follow-stats-btn" onClick={() => setShowFollowers(true)}>
            {followers.length} Followers
          </button>
          <button className="follow-stats-btn" onClick={() => setShowFollowing(true)}>
            {following.length} Following
          </button>
        </div>


        {!isOwnProfile && (
          <button onClick={handleFollowToggle} className="follow-btn">
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
        {isOwnProfile && (
          <button
            onClick={() => (window.location.href = `/profile/edit-profile`)}
            className="edit-btn"
          >
            Edit Profile
          </button>
        )}
      </div>
      {showFollowers && (
        <UserListModal
          title="Followers"
          users={followers}
          onClose={() => setShowFollowers(false)}
        />
      )}

      {showFollowing && (
        <UserListModal
          title="Following"
          users={following}
          onClose={() => setShowFollowing(false)}
        />
      )}

      <div className="user-posts-section">
        <h3>{isOwnProfile ? "Your Posts" : `${profile.name}'s Posts`}</h3>
        <PostList filterByUserId={profile.id} />
      </div>
    </div>
  );
};

export default ProfilePage;
