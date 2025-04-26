package com.example.coursemanagement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FollowRequest {

    @JsonProperty("userId")
    private String followerId;

    @JsonProperty("targetUserId")
    private String followingId;

    
    public String getFollowerId() {
        return followerId;
    }
    public void setFollowerId(String followerId) {
        this.followerId = followerId;
    }
    public String getFollowingId() {
        return followingId;
    }
    public void setFollowingId(String followingId) {
        this.followingId = followingId;
    }

    
}
