import React, { useState } from "react";
import "./PostItem.css";
import CommentModal from "./CommentModal";
import LikesModal from "./LikesModal"; 
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import axios from "axios";

const PostItem = ({ post, userEmail }) => {
  const [isLiked, setIsLiked] = useState(post.likedUserIds.includes(userEmail));
  const [likeCount, setLikeCount] = useState(post.likedUserIds.length);
  const [showComments, setShowComments] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  

  const commentCount = post.comments ? post.comments.length : 0;

  const handleLikeClick = async () => {
    console.log("Like button clicked for post:", post.id);
  
    try {
      await axios.post(
        `http://localhost:8080/api/posts/${post.id}/like`,
        {},
        { withCredentials: true }
      );
  
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("Error liking post:", error);
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


  const toggleLikesModal = () => {
    setShowLikes(!showLikes);
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
            onClick={toggleLikesModal} 
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
          <button onClick={handleLikeClick} className="likeBtn">
            {isLiked ? <AiFillLike color="blue" /> : <AiOutlineLike />}
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
          likedUserIds={post.likedUserIds}
          onClose={() => setShowLikes(false)}
        />
      )}
    </div>
  );
};

export default PostItem;
