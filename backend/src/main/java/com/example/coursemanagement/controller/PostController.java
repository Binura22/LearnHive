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
import com.example.coursemanagement.model.Notification;
import com.example.coursemanagement.repository.NotificationRepository;
import java.time.LocalDateTime;
import java.util.*;

@CrossOrigin(origins = "http://localhost:4000", allowCredentials = "true")
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private NotificationRepository notificationRepository;

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

            System.out.println("user id " + user.getUserId());
            Post post = new Post();
            post.setDescription(description);
            post.setMediaUrls(urls);
            post.setUserEmail(user.getAttribute("email"));
            post.setUserName(user.getAttribute("name"));
            post.setUserId(user.getUserId());

            return ResponseEntity.ok(postService.savePost(post));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Post creation failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/{postId}/comment/by-id/{commentId}")
    public ResponseEntity<?> deleteCommentById(
            @PathVariable String postId,
            @PathVariable String commentId,
            @AuthenticationPrincipal CustomOAuth2User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        if (commentId == null || commentId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Comment ID cannot be null or empty");
        }

        System.out.println("DELETE Comment Request:");
        System.out.println("Post ID: " + postId);
        System.out.println("Comment ID: " + commentId);
        System.out.println("User Email: " + user.getAttribute("email"));

        Post post = postService.getPostById(postId);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        System.out.println("--- All comments in this post ---");
        for (Comment c : post.getComments()) {
            System.out.println("Comment: ID=" + c.getId() + ", Text=" + c.getText() + ", User=" + c.getUserId());
        }

        Optional<Comment> optionalComment = post.getComments().stream()
                .filter(c -> c.getId() != null && c.getId().equals(commentId))
                .findFirst();

        if (!optionalComment.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found with ID: " + commentId);
        }

        Comment commentToDelete = optionalComment.get();
        post.getComments().remove(commentToDelete);
        Post updatedPost = postService.savePost(post);

        System.out.println("Comment deleted successfully. Remaining comments: " + updatedPost.getComments().size());

        return ResponseEntity.ok("Comment deleted successfully");
    }

    @DeleteMapping("/{postId}/comment/by-index/{commentIndex}")
    public ResponseEntity<?> deleteCommentByIndex(
            @PathVariable String postId,
            @PathVariable int commentIndex,
            @AuthenticationPrincipal CustomOAuth2User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        Post post = postService.getPostById(postId);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        List<Comment> comments = post.getComments();
        if (commentIndex < 0 || commentIndex >= comments.size()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid comment index");
        }

        String userEmail = user.getAttribute("email");

        if (!post.getUserEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only post owner can delete comments");
        }

        Post updatedPost = postService.deleteCommentByIndex(postId, commentIndex);
        if (updatedPost == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete comment");
        }

        return ResponseEntity.ok("Comment deleted");
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserPosts(@AuthenticationPrincipal CustomOAuth2User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
            // get MongoDB User ID from user details
            String userId = user.getUserId();
            List<Post> posts = postService.getUserPosts(userId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch posts");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllThePosts() {
        try {
            List<Post> posts = postService.getAllPosts();
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
    @PostMapping("/{postId}/like")
    public ResponseEntity<?> toggleLike(
            @PathVariable String postId,
            @AuthenticationPrincipal CustomOAuth2User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String userEmail = user.getAttribute("email");
        String userName = user.getAttribute("name");
        Post post = postService.findById(postId);

        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        List<String> likedUsers = post.getLikedUserIds();

        boolean isLiked = false;

        if (likedUsers.contains(userEmail)) {
            likedUsers.remove(userEmail);
        } else {
            likedUsers.add(userEmail);
            isLiked = true;
        }

        post.setLikedUserIds(likedUsers);
        postService.savePost(post);

        if (isLiked && !post.getUserEmail().equals(userEmail)) {
            Notification notification = new Notification();
            notification.setRecipientEmail(post.getUserEmail());
            notification.setSenderEmail(userEmail);
            notification.setPostId(postId);
            notification.setType("like");
            notification.setMessage(userName + " liked your post.");
            notification.setRead(false);
            notification.setTimestamp(LocalDateTime.now());
            notificationRepository.save(notification);
        }

        return ResponseEntity.ok("Like status updated");
    }

    // get comments to a post
    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable String postId) {
        Post post = postService.getPostById(postId);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        if (post.getComments() != null) {
            for (Comment comment : post.getComments()) {
                if (comment.getUserId() == null || comment.getUserId().trim().isEmpty()) {
                    comment.setUserId(post.getUserId());
                }
                if (comment.getUserEmail() == null || comment.getUserEmail().trim().isEmpty()) {
                    comment.setUserEmail(post.getUserId());
                }
            }
            
            //postService.savePost(post);
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
        comment.setUserId(user.getUserId());
        comment.setUserEmail(user.getAttribute("email"));
        comment.setText(commentText);
        comment.setUserName(user.getName());

        if (comment.getId() == null) {
            comment.setId(UUID.randomUUID().toString());
        }

        System.out.println("Creating comment with ID: " + comment.getId());

        Post updatedPost = postService.addCommentToPost(postId, comment);

        if (updatedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        return ResponseEntity.ok(updatedPost);
    }

    @PostMapping("/{postId}/comment/{commentId}/reply")
    public ResponseEntity<?> replyToComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomOAuth2User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String replyText = payload.get("text");
        if (replyText == null || replyText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Reply text cannot be empty");
        }

        Comment reply = new Comment();
        reply.setUserId(user.getUserId());
        reply.setUserEmail(user.getAttribute("email"));
        reply.setText(replyText);
        // Ensure reply has an ID
        if (reply.getId() == null) {
            reply.setId(UUID.randomUUID().toString());
        }

        Post post = postService.getPostById(postId);
        String originalCommentUserId = null;
        String originalCommentUserEmail = null;
        if (post != null && post.getComments() != null) {
            for (Comment comment : post.getComments()) {
                if (comment.getId().equals(commentId)) {
                    originalCommentUserId = comment.getUserId();
                    originalCommentUserEmail = comment.getUserId();
                    break;
                }
            }
        }

        Post updatedPost = postService.addReplyToComment(postId, commentId, reply);

        if (updatedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post or comment not found");
        }

        if (originalCommentUserId != null && !originalCommentUserId.equals(user.getName())) {
            Notification notification = new Notification();
            notification.setRecipientEmail(originalCommentUserEmail);
            notification.setSenderEmail(user.getAttribute("email"));
            notification.setPostId(postId);
            notification.setType("reply");
            notification.setMessage(user.getAttribute("name") + " replied to your comment.");
            notification.setRead(false);
            notification.setTimestamp(LocalDateTime.now());
            notificationRepository.save(notification);
        }

        return ResponseEntity.ok(updatedPost);
    }

    @GetMapping("/repair-comments")
    public ResponseEntity<?> repairCommentIds(@AuthenticationPrincipal CustomOAuth2User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        int postsProcessed = 0;
        int commentsRepaired = 0;
        int emailsRepaired = 0;

        List<Post> allPosts = postService.getAllPosts();

        for (Post post : allPosts) {
            boolean postModified = false;

            if (post.getComments() != null) {
                for (Comment comment : post.getComments()) {
                    if (comment.getId() == null || comment.getId().trim().isEmpty()) {
                        comment.setId(UUID.randomUUID().toString());
                        commentsRepaired++;
                        postModified = true;
                    }
                    if ((comment.getUserEmail() == null || comment.getUserEmail().trim().isEmpty())
                            && post.getUserEmail() != null) {
                        comment.setUserEmail(post.getUserEmail());
                        emailsRepaired++;
                        postModified = true;
                    }
                }
            }

            if (postModified) {
                postService.savePost(post);
                postsProcessed++;
            }
        }

        return ResponseEntity.ok("Repair complete: Fixed " + commentsRepaired +
                " comment IDs and " + emailsRepaired + " comment emails across " + postsProcessed + " posts");
    }

}
