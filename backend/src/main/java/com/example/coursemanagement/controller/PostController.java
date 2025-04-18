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

import java.io.IOException;
import java.util.*;

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
            post.setUserEmail(user.getAttribute("email"));

            return ResponseEntity.ok(postService.savePost(post));

        } catch (Exception e) {
            e.printStackTrace(); // This will print full stack trace in backend console
            return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR)
                    .body("Post creation failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/{postId}")
    public void deletePost(@PathVariable String postId) {
        postService.deletePost(postId);
    }
}
