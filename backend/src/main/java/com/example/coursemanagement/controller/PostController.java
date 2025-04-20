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
import com.example.coursemanagement.model.Comment;
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

    // [Like or Unlike a Post]
    @PutMapping("/{postId}/like")
    public ResponseEntity<?> toggleLike(
            @PathVariable String postId,
            @AuthenticationPrincipal CustomOAuth2User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).body("User not authenticated");
        }

        String userId = user.getAttribute("email");
        Post post = postService.findById(postId);

        if (post == null) {
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body("Post not found");
        }

        List<String> likedUsers = post.getLikedUserIds();

        if (likedUsers.contains(userId)) {
            likedUsers.remove(userId); // Unlike
        } else {
            likedUsers.add(userId); // Like
        }

        post.setLikedUserIds(likedUsers);
        postService.savePost(post);

        return ResponseEntity.ok("Like status updated");
    }

    // [Add a Comment to a Post]
    @PostMapping("/{postId}/comment")
    public ResponseEntity<?> addComment(
            @PathVariable String postId,
            @RequestBody String commentText,
            @AuthenticationPrincipal CustomOAuth2User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).body("User not authenticated");
        }

        Post post = postService.findById(postId);

        if (post == null) {
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body("Post not found");
        }

        Comment comment = new Comment();
        comment.setText(commentText);
        comment.setUserId(user.getAttribute("email"));

        post.getComments().add(comment);
        postService.savePost(post);

        return ResponseEntity.ok(post.getComments());
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<?> addCommentToPost(
            @PathVariable String postId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomOAuth2User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.SC_UNAUTHORIZED).body("User not authenticated");
        }

        String commentText = payload.get("text");

        Comment comment = new Comment();
        comment.setUserId(user.getName()); // or user.getAttribute("email") if you prefer email
        comment.setText(commentText);

        Post updatedPost = postService.addCommentToPost(postId, comment);

        if (updatedPost == null) {
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body("Post not found");
        }

        return ResponseEntity.ok(updatedPost);
    }

}
