package com.example.coursemanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String name;
    private String role; // ADMIN or USER
    private String provider; // LOCAL, GOOGLE, etc.
    private String providerId; // For OAuth providers (e.g., Google ID)

    // New fields for user profile
    private String profilePicture; // URL or base64
    private String bio;
    private List<String> socialLinks = new ArrayList<>(); // e.g., LinkedIn, GitHub

    // User interactivity
    private List<String> postIds = new ArrayList<>();
    private List<String> likedPostIds = new ArrayList<>();
    private List<String> commentIds = new ArrayList<>();

    // Following system
    private List<String> following = new ArrayList<>(); // users this user follows
    private List<String> followers = new ArrayList<>(); // users who follow this user

    // Constructors
    public User() {}

    public User(String email, String name, String role, String provider, String providerId) {
        this.email = email;
        this.name = name;
        this.role = role;
        this.provider = provider;
        this.providerId = providerId;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
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
