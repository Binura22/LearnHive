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
    private String provider; // LOCAL, GOOGLE, github
    private String providerId; // For OAuth providers

    // New fields for user profile
    private String profileImage;
    private String bio;
    private String coverImage;
    private List<String> socialLinks = new ArrayList<>(); // LinkedIn, GitHub
    private LocalDateTime registrationDate;
    private boolean profileCompleted;


    // User interactivity
    private List<String> postIds = new ArrayList<>();
    private List<String> likedPostIds = new ArrayList<>();
    private List<String> commentIds = new ArrayList<>();

    // Following system
    private List<String> following = new ArrayList<>(); 
    private List<String> followers = new ArrayList<>();

}