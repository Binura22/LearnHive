package com.example.coursemanagement.controller;

import com.example.coursemanagement.model.Post;
import com.example.coursemanagement.service.CloudinaryService;
import com.example.coursemanagement.service.PostService;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.coursemanagement.config.CustomOAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

//import java.io.IOException;
import java.util.*;

//@CrossOrigin(origins = "http://localhost:4000", allowCredentials = "true")
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/create")
    public ResponseEntity<?> createPost(@RequestParam("description") String description,
            @RequestParam("media") MultipartFile[] files,
            @AuthenticationPrincipal CustomOAuth2User user) {
        System.out.println("Hello here");
        try {
            if (user == null) {
                return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).body("User not authenticated");
            }

            List<String> urls = new ArrayList<>();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
                    urls.add(uploadResult.get("url"));
                }
            }

            Post post = new Post();
            post.setDescription(description);
            post.setMediaUrls(urls);
            post.setUserId(user.getId()); // assuming getId() returns MongoDB ObjectId string

            return ResponseEntity.ok(postService.savePost(post));

        } catch (Exception e) {
            e.printStackTrace(); // This will print full stack trace in backend console
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR)
                    .body("Post creation failed: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserPosts(@AuthenticationPrincipal CustomOAuth2User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).body("User not authenticated");
        }

        try {
            // Assume you can get MongoDB User ID from user details
            String userId = user.getId(); // Or fetch from DB if needed
            List<Post> posts = postService.getUserPosts(userId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body("Failed to fetch posts");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPosts() {
        try {
            List<Post> posts = postService.getAllPosts(); // new method in service
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR).body("Failed to fetch posts");
        }
    }

    @DeleteMapping("/{postId}")
    public void deletePost(@PathVariable String postId) {
        postService.deletePost(postId);
    }
}
