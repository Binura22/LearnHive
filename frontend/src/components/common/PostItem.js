import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./PostItem.css";
import CommentModal from "./CommentModal";
import LikesModal from "./LikesModal";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import { FiMoreVertical } from "react-icons/fi";
import axios from "axios";
import { getUserById } from "../../services/api";

const PostItem = ({ post, userEmail, onPostDelete }) => {
  const [likedUserIds, setLikedUserIds] = useState(post.likedUserIds || []);
  const [isLiked, setIsLiked] = useState(likedUserIds.includes(userEmail));
  const [likeCount, setLikeCount] = useState(likedUserIds.length);
  const [showComments, setShowComments] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [modalKey, setModalKey] = useState(Date.now());
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(post.description);
  const [isUpdating, setIsUpdating] = useState(false);
  const [authorProfileImage, setAuthorProfileImage] = useState(null);
  const [currentCommentCount, setCurrentCommentCount] = useState(post.comments ? post.comments.length : 0);

  const carouselSettings = {
    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
    customPaging: () => <div className="tiny-dot" />,
    appendDots: dots => (
      <div className="dots-wrapper">
        <ul>{dots}</ul>
      </div>
    )
  };


  const currentUserName =
    localStorage.getItem("userName") || userEmail?.split("@")[0] || "User";
  const loggedUserId = localStorage.getItem("userId");

  // check current user == post owner
  const isPostOwner = post.userId === loggedUserId;

  useEffect(() => {
    if (post.mediaUrls?.length > 1) {
      const dots = document.querySelectorAll('.custom-dot');
      if (dots.length > 0) {
        dots[0].style.opacity = '1';
        dots[0].style.transform = 'scale(1.2)';
      }
    }
  }, [post.mediaUrls]);

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    setLikedUserIds(post.likedUserIds || []);
    setIsLiked(post.likedUserIds?.includes(userEmail));
    setLikeCount(post.likedUserIds?.length || 0);
  }, [post, userEmail]);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const response = await getUserById(post.userId);
        if (response.data && response.data.profileImage) {
          setAuthorProfileImage(response.data.profileImage);
        }
      } catch (error) {
        console.error("Failed to fetch author data:", error);
      }
    };

    if (post.userId) {
      fetchAuthorData();
    }
  }, [post.userId]);

  const handleLikeClick = async () => {
    try {
      const likeButton = document.querySelector('.likeBtn');
      if (likeButton) likeButton.style.opacity = '0.7';

      const response = await axios.post(
        `http://localhost:8080/api/posts/${post.id}/like`,
        {},
        { withCredentials: true }
      );

      if (response.data) {
        console.log("Like response from server:", response.data);

        const serverLikeCount = response.data.likedCount;
        const serverIsLiked = response.data.isLiked;

        setIsLiked(serverIsLiked);
        setLikeCount(serverLikeCount);

        if (serverIsLiked) {
          setLikedUserIds(prev => {
            const newArray = [...prev];
            if (!newArray.includes(userEmail)) {
              newArray.push(userEmail);
            }
            return newArray;
          });
        } else {
          setLikedUserIds(prev => prev.filter(id => id !== userEmail));
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      const likeButton = document.querySelector('.likeBtn');
      if (likeButton) likeButton.style.opacity = '1';
    }
  };

  const verifyPostOwner = () => {
    console.log("Post Details:", {
      id: post.id,
      userName: post.userName,
      userEmail: post.userEmail,
      currentUserEmail: userEmail,
    });
  };

  const handleOpenComments = () => {
    verifyPostOwner();

    let latestUserEmail = userEmail;
    const storedEmail = localStorage.getItem("userEmail");

    if (storedEmail && (!userEmail || userEmail !== storedEmail)) {
      console.log("Using more recent email from localStorage:", storedEmail);
      latestUserEmail = storedEmail;
    }

    setShowComments(true);
  };

  const openLikesModal = async () => {
    try {
      setShowLikes(true);

      const response = await axios.get(
        `http://localhost:8080/api/posts/${post.id}`,
        { withCredentials: true }
      );

      let freshLikedUserIds = response.data.likedUserIds || [];

      freshLikedUserIds = freshLikedUserIds.filter(id => id);

      setLikedUserIds(freshLikedUserIds);
      setLikeCount(freshLikedUserIds.length);
      setModalKey(Date.now());

      console.log("Opening likes modal with fresh data:", freshLikedUserIds);
    } catch (error) {
      console.error("Error fetching updated post data:", error);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDeletePost = async (e) => {
    e.stopPropagation();

    if (
      window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      setIsDeleting(true);
      try {
        await axios.delete(`http://localhost:8080/api/posts/${post.id}`, {
          withCredentials: true,
        });

        if (onPostDelete) {
          console.log("Calling onPostDelete with ID:", post.id);
          onPostDelete(post.id);
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post. Please try again.");
      } finally {
        setIsDeleting(false);
        setShowMenu(false);
      }
    }
  };

  const handleEditPost = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleUpdatePost = async () => {
    if (!editedDescription.trim()) {
      alert("Post description cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      console.log("Updating post with ID:", post.id);
      console.log("New description:", editedDescription);

      const response = await axios.put(
        `http://localhost:8080/api/posts/${post.id}`,
        { description: editedDescription },
        { withCredentials: true }
      );

      console.log("Update response:", response.data);

      post.description = editedDescription;
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        alert(`Failed to update post: ${error.response.data || error.message}`);
      } else {
        alert("Failed to update post. Please try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedDescription(post.description);
    setIsEditing(false);
  };

  const handleCommentAdded = () => {
    setCurrentCommentCount(prevCount => prevCount + 1);
  };

  const handleCommentDeleted = () => {
    setCurrentCommentCount(prevCount => Math.max(0, prevCount - 1));
  };

  const refreshPostData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/posts/${post.id}`,
        { withCredentials: true }
      );
      
      if (response.data) {
        setCurrentCommentCount(response.data.comments ? response.data.comments.length : 0);
      }
    } catch (error) {
      console.error("Error refreshing post data:", error);
    }
  };

  return (
    <div className="postItem">
      <div className="postMedia">
        {post.mediaUrls?.length > 1 ? (
          <Slider {...carouselSettings} className="post-carousel">
            {post.mediaUrls.map((url, index) => (
              <div key={index} className="carousel-slide">
                {url.endsWith('.mp4') || url.endsWith('.webm') ? (
                  <video controls className="post-media-item">
                    <source src={url} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={url}
                    alt={`Post ${index + 1}`}
                    className="post-media-item"
                  />
                )}
                
              </div>
            ))}
          </Slider>
        ) : post.mediaUrls?.length === 1 ? (
          post.mediaUrls[0].endsWith('.mp4') || post.mediaUrls[0].endsWith('.webm') ? (
            <video controls className="post-media-item">
              <source src={post.mediaUrls[0]} type="video/mp4" />
            </video>
          ) : (
            <img src={post.mediaUrls[0]} alt="Post" className="post-media-item" />
          )
        ) : null}
      </div>

      <div className="postContent">
        <div className="postHeader">
          <div className="post-author-container">
            <img
              src={authorProfileImage || "/default-profile.png"}
              alt={post.userName}
              className="user-avatar post-avatar"
            />

            <Link to={`/profile/${post.userId}`} className="post-author-name">
              {post.userName}
            </Link>
          </div>

          {isPostOwner && (
            <div className="post-options">
              <button
                className="options-btn"
                onClick={handleMenuClick}
                disabled={isDeleting || isUpdating}
              >
                <FiMoreVertical size={20} />
              </button>

              {showMenu && (
                <div
                  className="options-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="edit-option" onClick={handleEditPost}>
                    Edit Post
                  </button>
                  <button
                    className="delete-option"
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Post"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="edit-post-container">
            <textarea
              className="edit-post-textarea"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
            <div className="edit-post-buttons">
              <button
                className="update-post-btn"
                onClick={handleUpdatePost}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Post"}
              </button>
              <button
                className="cancel-edit-btn"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="postDescription">{post.description}</p>
        )}

        <p className="postTime">{new Date(post.createdAt).toLocaleString()}</p>

        <p className="likeCount">
          <span
            onClick={openLikesModal}
            style={{ cursor: "pointer", color: "#3b5998" }}
          >
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </span>{" "}
          &bull;{" "}
          <span
            onClick={handleOpenComments}
            style={{ cursor: "pointer", color: "#3b5998" }}
          >
            {currentCommentCount} {currentCommentCount === 1 ? "Comment" : "Comments"}
          </span>
        </p>

        <div className="postActions">
          <button
            onClick={handleLikeClick}
            className="likeBtn"
            style={{
              transition: 'transform 0.2s ease',
              backgroundColor: isLiked ? '#f0f8ff' : 'transparent',
              borderRadius: '50%',
              padding: '8px'
            }}
          >
            {isLiked ?
              <AiFillLike color="#1877f2" size={22} /> :
              <AiOutlineLike size={22} />
            }
          </button>
          <button onClick={handleOpenComments} className="commentBtn">
            <FaRegComment />
          </button>
        </div>
      </div>

      {showComments && (
        <CommentModal
          postId={post.id}
          onClose={() => {
            setShowComments(false);
            refreshPostData(); // Refresh data when modal closes
          }}
          userEmail={userEmail}
          postOwnerEmail={post.userEmail}
          postOwnerName={post.userName}
          onCommentAdded={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      )}

      {showLikes && (
        <LikesModal
          key={`modal-${modalKey}`}
          postId={post.id}
          likedUserIds={likedUserIds.filter(id => id)}
          currentUserEmail={userEmail}
          currentUserName={currentUserName}
          onClose={() => setShowLikes(false)}
        />
      )}
    </div>
  );
};

export default PostItem;