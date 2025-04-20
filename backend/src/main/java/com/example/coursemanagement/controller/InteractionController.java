package com.example.coursemanagement.controller;

import com.example.coursemanagement.model.User;
import com.example.coursemanagement.service.UserService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interactions")
public class InteractionController {

    @Autowired
    private UserService userService;

    // Add Post ID
    @PostMapping("/post")
    public ResponseEntity<?> addPostToUser(@RequestParam String userId, @RequestParam String postId) {
        System.out.println("I'm here");
        userService.addPostToUser(userId, postId);
        return ResponseEntity.ok("Post added to user.");
    }

    // Add Like
    @PostMapping("/like")
    public ResponseEntity<?> addLikeToUser(@RequestParam String userId, @RequestParam String postId) {
        userService.likePost(userId, postId);
        return ResponseEntity.ok("Post liked.");
    }

    // Remove Like
    @DeleteMapping("/like")
    public ResponseEntity<?> removeLikeFromUser(@RequestParam String userId, @RequestParam String postId) {
        userService.unlikePost(userId, postId);
        return ResponseEntity.ok("Post unliked.");
    }

    // Add Comment
    @PostMapping("/comment")
    public ResponseEntity<?> addCommentToUser(@RequestParam String userId, @RequestParam String commentId) {
        userService.addCommentToUser(userId, commentId);
        return ResponseEntity.ok("Comment added.");
    }

    // Follow a user
    @PostMapping("/follow")
    public ResponseEntity<?> followUser(@RequestParam String followerId, @RequestParam String followingId) {
        userService.followUser(followerId, followingId);
        return ResponseEntity.ok("Followed user.");
    }

    // Unfollow a user
    @DeleteMapping("/follow")
    public ResponseEntity<?> unfollowUser(@RequestParam String followerId, @RequestParam String followingId) {
        userService.unfollowUser(followerId, followingId);
        return ResponseEntity.ok("Unfollowed user.");
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable String userId) {
        try {
            List<User> followers = userService.getFollowers(userId);
            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<?> getFollowing(@PathVariable String userId) {
        try {
            List<User> following = userService.getFollowing(userId);
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

}
