import React, { useState } from "react";
import "./PostItem.css";
import CommentModal from "./CommentModal";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import axios from "axios";

const PostItem = ({ post, userEmail }) => {
  const [isLiked, setIsLiked] = useState(post.likedUserIds.includes(userEmail));
  const [likeCount, setLikeCount] = useState(post.likedUserIds.length);
  const [showComments, setShowComments] = useState(false);

  const handleLikeClick = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/posts/${post.id}/like`,
        {},
        { withCredentials: true }
      );

      setIsLiked(!isLiked);
      setLikeCount(response.data.likedUserIds.length);
    } catch (error) {
      console.error("Error liking post:", error);
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

        <p className="likeCount">{likeCount} {likeCount === 1 ? "Like" : "Likes"}</p>

        <div className="postActions">
          <button onClick={handleLikeClick} className="likeBtn">
            {isLiked ? <AiFillLike color="blue" /> : <AiOutlineLike />}
          </button>
          <button onClick={() => setShowComments(true)} className="commentBtn">
            <FaRegComment />
          </button>
        </div>
      </div>

      {showComments && (
        <CommentModal
          postId={post.id}
          onClose={() => setShowComments(false)}
          userEmail={userEmail}
        />
      )}
    </div>
  );
};

export default PostItem;
