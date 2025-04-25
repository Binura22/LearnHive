package com.example.coursemanagement.model;

import org.springframework.data.annotation.Id;
import java.util.Date;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

public class Comment {

    @Id
    private String id;
    private String userId;
    private String text;
    private Date timestamp;
    private List<Comment> replies = new ArrayList<>();
    private String userEmail;

    public Comment() {
        this.timestamp = new Date();
        this.id = UUID.randomUUID().toString();
        System.out.println("Created new comment with ID: " + this.id);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public List<Comment> getReplies() {
        return replies;
    }

    public void setReplies(List<Comment> replies) {
        this.replies = replies;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    @Override
    public String toString() {
        return "Comment{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", text='" + text + '\'' +
                ", timestamp=" + timestamp +
                ", replies=" + replies +
                ", userEmail='" + userEmail + '\'' +
                '}';
    }
}
