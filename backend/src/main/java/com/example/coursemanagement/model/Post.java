package com.example.coursemanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

// [Added for Like & Comment]
import java.util.ArrayList;
import com.example.coursemanagement.model.Comment;

@Document(collection = "posts")
public class Post {

    @Id
    private String id;
    private String description;
    private List<String> mediaUrls;
    private String userEmail; // From authenticated user
    private long createdAt = System.currentTimeMillis();

    public String getId() {
        return id;
    }

    // [Added for Like & Comment]
    private List<String> likedUserIds = new ArrayList<>();
    private List<Comment> comments = new ArrayList<>();

    public void setId(String id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    // [Added for Like & Comment]
    public List<String> getLikedUserIds() {
        return likedUserIds;
    }

    public void setLikedUserIds(List<String> likedUserIds) {
        this.likedUserIds = likedUserIds;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

}
