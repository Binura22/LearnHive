package com.example.coursemanagement.dto;

import java.util.List;

public class UserProfileDTO {
    private String id;
    private String name;
    private String email;
    private String profilePicture;
    private String bio;
    private List<String> socialLinks;
    private List<String> postIds;          
    private List<String> likedPostIds;
    private List<String> commentIds;
    private List<String> following;
    private List<String> followers;

    public UserProfileDTO() {}

    public UserProfileDTO(String id, String name, String email, String profilePicture, String bio,
                          List<String> socialLinks, List<String> postIds, List<String> likedPostIds,
                          List<String> commentIds, List<String> following, List<String> followers) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profilePicture = profilePicture;
        this.bio = bio;
        this.socialLinks = socialLinks;
        this.postIds = postIds;
        this.likedPostIds = likedPostIds;
        this.commentIds = commentIds;
        this.following = following;
        this.followers = followers;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public List<String> getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(List<String> socialLinks) {
        this.socialLinks = socialLinks;
    }

    public List<String> getPostIds() {
        return postIds;
    }

    public void setPostIds(List<String> postIds) {
        this.postIds = postIds;
    }

    public List<String> getLikedPostIds() {
        return likedPostIds;
    }

    public void setLikedPostIds(List<String> likedPostIds) {
        this.likedPostIds = likedPostIds;
    }

    public List<String> getCommentIds() {
        return commentIds;
    }

    public void setCommentIds(List<String> commentIds) {
        this.commentIds = commentIds;
    }

    public List<String> getFollowing() {
        return following;
    }

    public void setFollowing(List<String> following) {
        this.following = following;
    }

    public List<String> getFollowers() {
        return followers;
    }

    public void setFollowers(List<String> followers) {
        this.followers = followers;
    }

}
