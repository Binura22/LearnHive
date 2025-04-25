package com.example.coursemanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
    private String profileImage; // URL or base64
    private String bio;
    private String coverImage;
    private List<String> socialLinks = new ArrayList<>(); // e.g., LinkedIn, GitHub
    private LocalDateTime registrationDate;
    private boolean profileCompleted;

    // User interactivity
    private List<String> postIds = new ArrayList<>();
    private List<String> likedPostIds = new ArrayList<>();
    private List<String> commentIds = new ArrayList<>();

    // Following system
    private List<String> following = new ArrayList<>(); // users this user follows
    private List<String> followers = new ArrayList<>(); // users who follow this user

    // Getters and Setters
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

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}