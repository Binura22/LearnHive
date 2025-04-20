package com.example.coursemanagement.controller;

import com.example.coursemanagement.model.Post;
import com.example.coursemanagement.service.CloudinaryService;
import com.example.coursemanagement.service.PostService;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.coursemanagement.config.CustomOAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.coursemanagement.model.Comment;
//import java.io.IOException;
import java.util.*;

@CrossOrigin(origins = "http://localhost:4000", allowCredentials = "true")
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPost(@RequestParam("description") String description,
            @RequestParam("media") MultipartFile[] files,
            @AuthenticationPrincipal CustomOAuth2User user) {
        System.out.println("Hello here");
        try {
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            System.out.println("inside try block");
            List<String> urls = new ArrayList<>();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
                    urls.add(uploadResult.get("url"));
                }
            }

            System.out.println("user id "+ user.getId());
            Post post = new Post();
            post.setDescription(description);
            post.setMediaUrls(urls);
            post.setUserId(user.getId()); // assuming getId() returns MongoDB ObjectId string

            return ResponseEntity.ok(postService.savePost(post));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Post creation failed: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserPosts(@AuthenticationPrincipal CustomOAuth2User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
            // Assume you can get MongoDB User ID from user details
            String userId = user.getId(); // Or fetch from DB if needed
            List<Post> posts = postService.getUserPosts(userId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch posts");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllThePosts() {
        try {
            List<Post> posts = postService.getAllPosts(); // new method in service
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch posts");
        }
    }

    @DeleteMapping("/{postId}")
    public void deletePost(@PathVariable String postId) {
        postService.deletePost(postId);
    }

    // like, unlike
    @PutMapping("/{postId}/like")
    public ResponseEntity<?> toggleLike(
            @PathVariable String postId,
            @AuthenticationPrincipal CustomOAuth2User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String userId = user.getAttribute("email");
        Post post = postService.findById(postId);

        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        List<String> likedUsers = post.getLikedUserIds();

        if (likedUsers.contains(userId)) {
            likedUsers.remove(userId);
        } else {
            likedUsers.add(userId);
        }

        post.setLikedUserIds(likedUsers);
        postService.savePost(post);

        return ResponseEntity.ok("Like status updated");
    }

    // get comments to a post
    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable String postId) {
        Post post = postService.getPostById(postId);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }
        return ResponseEntity.ok(post);
    }

    // add a comment to a post
    @PostMapping("/{postId}/comment")
    public ResponseEntity<?> addCommentToPost(
            @PathVariable String postId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomOAuth2User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String commentText = payload.get("text");

        Comment comment = new Comment();
        comment.setUserId(user.getName());
        comment.setText(commentText);

        Post updatedPost = postService.addCommentToPost(postId, comment);

        if (updatedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        return ResponseEntity.ok(updatedPost);
    }

}
