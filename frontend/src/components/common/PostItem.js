import React, { useState, useEffect } from "react";
import "./PostItem.css";
import CommentModal from "./CommentModal";
import LikesModal from "./LikesModal"; 
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import axios from "axios";

const PostItem = ({ post, userEmail }) => {
  const [likedUserIds, setLikedUserIds] = useState(post.likedUserIds || []);
  const [isLiked, setIsLiked] = useState(likedUserIds.includes(userEmail));
  const [likeCount, setLikeCount] = useState(likedUserIds.length);
  const [showComments, setShowComments] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [modalKey, setModalKey] = useState(Date.now());
  
  const currentUserName = localStorage.getItem('userName') || userEmail?.split('@')[0] || "User";
  
  useEffect(() => {
    setLikedUserIds(post.likedUserIds || []);
    setIsLiked(post.likedUserIds?.includes(userEmail));
    setLikeCount(post.likedUserIds?.length || 0);
  }, [post, userEmail]);
  
  const commentCount = post.comments ? post.comments.length : 0;


  const handleLikeClick = async () => {
    try {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      
      const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
      setLikeCount(newLikeCount);
      
      if (newIsLiked) {
        setLikedUserIds(prev => [...prev, userEmail]);
      } else {
        setLikedUserIds(prev => prev.filter(email => email !== userEmail));
      }
      
      const response = await axios.post(
        `http://localhost:8080/api/posts/${post.id}/like`,
        {},
        { withCredentials: true }
      );
      
      const updatedPost = await axios.get(
        `http://localhost:8080/api/posts/${post.id}`, 
        { withCredentials: true }
      );
      

      const updatedLikedUserIds = updatedPost.data.likedUserIds || [];
      setLikedUserIds(updatedLikedUserIds);
      setIsLiked(updatedLikedUserIds.includes(userEmail));
      setLikeCount(updatedLikedUserIds.length);
      

      setModalKey(Date.now());
      
      console.log("Like operation completed. Updated liked users:", updatedLikedUserIds);
    } catch (error) {

      console.error("Error liking post:", error);
      setIsLiked(!isLiked); 
      const revertedLikeCount = isLiked ? likeCount + 1 : likeCount - 1;
      setLikeCount(revertedLikeCount);
    }
  };

  const verifyPostOwner = () => {
    console.log("Post Details:", {
      id: post.id,
      userName: post.userName,
      userEmail: post.userEmail, 
      currentUserEmail: userEmail 
    });
  };

  const handleOpenComments = () => {
    verifyPostOwner();
    
    let latestUserEmail = userEmail;
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedEmail && (!userEmail || userEmail !== storedEmail)) {
      console.log("Using more recent email from localStorage:", storedEmail);
      latestUserEmail = storedEmail;
    }
    
    setShowComments(true);
  };


  const openLikesModal = async () => {
    try {

      const response = await axios.get(
        `http://localhost:8080/api/posts/${post.id}`, 
        { withCredentials: true }
      );
      

      const freshLikedUserIds = response.data.likedUserIds || [];
      setLikedUserIds(freshLikedUserIds);
      setLikeCount(freshLikedUserIds.length);
      

      setModalKey(Date.now());
      setShowLikes(true);
      
      console.log("Opening likes modal with fresh data:", freshLikedUserIds);
    } catch (error) {
      console.error("Error fetching updated post data:", error);

      setShowLikes(true);
    }
  };

  return (
    <div className="postItem">
      <div className="postImage">
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <img src={post.mediaUrls[0]} alt="Post" />
        )}
      </div>

      <div className="postContent">
        <p className="postDescription">{post.description}</p>
        <p className="postTime">
          {new Date(post.createdAt).toLocaleString()}
        </p>
        <p className="postAuthor">Posted by: {post.userName}</p>

        <p className="likeCount">
          <span 
            onClick={openLikesModal} 
            style={{ cursor: 'pointer', color: '#3b5998' }}
          >
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </span> &bull; <span
            onClick={handleOpenComments}
            style={{ cursor: 'pointer', color: '#3b5998' }}
          >
            {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
          </span>
        </p>

        <div className="postActions">
          <button 
            onClick={handleLikeClick} 
            className="likeBtn"
            style={{ transition: 'transform 0.2s ease' }} 
          >
            {isLiked ? 
              <AiFillLike color="blue" size={22} /> : 
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
          onClose={() => setShowComments(false)}
          userEmail={userEmail}
          postOwnerEmail={post.userEmail} 
          postOwnerName={post.userName}
        />
      )}

      {showLikes && (
        <LikesModal
          key={`modal-${modalKey}`}
          postId={post.id}
          likedUserIds={likedUserIds}
          currentUserEmail={userEmail}
          currentUserName={currentUserName}
          onClose={() => setShowLikes(false)}
        />
      )}
    </div>
  );
};

export default PostItem;
