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

    @DeleteMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @AuthenticationPrincipal CustomOAuth2User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        Post post = postService.getPostById(postId);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        Optional<Comment> optionalComment = post.getComments().stream()
                .filter(c -> c.getId() != null && c.getId().equals(commentId))
                .findFirst();

        if (!optionalComment.isPresent()) {
            boolean foundInReplies = false;
            for (Comment mainComment : post.getComments()) {
                if (mainComment.getReplies() != null) {
                    Optional<Comment> replyComment = mainComment.getReplies().stream()
                            .filter(r -> r.getId() != null && r.getId().equals(commentId))
                            .findFirst();

                    if (replyComment.isPresent()) {
                        Comment reply = replyComment.get();
                        if (!reply.getUserId().equals(user.getUserId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body("Only the comment owner can delete this comment");
                        }

                        mainComment.getReplies().remove(reply);
                        foundInReplies = true;
                        break;
                    }
                }
            }

            if (!foundInReplies) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found");
            }
        } else {
            Comment comment = optionalComment.get();

            if (!comment.getUserId().equals(user.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only the comment owner can delete this comment");
            }

            post.getComments().remove(comment);
        }

        Post updatedPost = postService.savePost(post);

        return ResponseEntity.ok(updatedPost);
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserPosts(@AuthenticationPrincipal CustomOAuth2User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
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
            try {
                Notification notification = new Notification();
                notification.setRecipientEmail(post.getUserEmail());
                notification.setSenderEmail(userEmail);
                notification.setPostId(postId);
                notification.setType("like");
                notification.setMessage(userName + " liked your post.");
                notification.setRead(false);
                notification.setTimestamp(LocalDateTime.now());
                notificationRepository.save(notification);
                System.out.println("Like notification created for: " + post.getUserEmail());
            } catch (Exception e) {
                System.err.println("Failed to create like notification: " + e.getMessage());
                e.printStackTrace();
            }
        }

        return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "Like status updated",
                "likedCount", likedUsers.size(),
                "isLiked", isLiked));
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
                    comment.setUserEmail(post.getUserEmail());
                }
                if (comment.getUserName() == null || comment.getUserName().trim().isEmpty()) {
                    comment.setUserName(post.getUserName());
                }

                if (comment.getReplies() != null) {
                    for (Comment reply : comment.getReplies()) {
                        if (reply.getUserName() == null || reply.getUserName().trim().isEmpty()) {
                            if (reply.getUserId() != null && reply.getUserId().contains("@")) {
                                reply.setUserName(reply.getUserId().split("@")[0]);
                            } else if (reply.getUserEmail() != null) {
                                reply.setUserName(reply.getUserEmail().split("@")[0]);
                            } else {
                                String userId = reply.getUserId();
                                if (userId != null && userId.length() > 5) {
                                    reply.setUserName(userId.substring(0, 5) + "...");
                                } else {
                                    reply.setUserName("User");
                                }
                            }
                        }
                    }
                }
            }

            postService.savePost(post);
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

        Post post = postService.getPostById(postId);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        Post updatedPost = postService.addCommentToPost(postId, comment);
        if (updatedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        String currentUserEmail = user.getAttribute("email");
        String currentUserName = user.getName();

        if (!post.getUserEmail().equals(currentUserEmail)) {
            Notification notification = new Notification();
            notification.setRecipientEmail(post.getUserEmail());
            notification.setSenderEmail(currentUserEmail);
            notification.setPostId(postId);
            notification.setType("comment");
            notification.setMessage(currentUserName + " commented on your post.");
            notification.setRead(false);
            notification.setTimestamp(LocalDateTime.now());
            notificationRepository.save(notification);
            System.out.println("Comment notification created for: " + post.getUserEmail());
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
        reply.setUserName(user.getName());

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
                    originalCommentUserEmail = comment.getUserEmail();
                    break;
                }
            }
        }

        Post updatedPost = postService.addReplyToComment(postId, commentId, reply);

        if (updatedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post or comment not found");
        }

        if (originalCommentUserId != null && !originalCommentUserId.equals(user.getUserId())) {
            Notification notification = new Notification();
            notification.setRecipientEmail(originalCommentUserEmail);
            notification.setSenderEmail(user.getAttribute("email"));
            notification.setPostId(postId);
            notification.setType("reply");
            notification.setMessage(user.getName() + " replied to your comment.");
            notification.setRead(false);
            notification.setTimestamp(LocalDateTime.now());
            notificationRepository.save(notification);
            System.out.println("Reply notification created for: " + originalCommentUserEmail);
        }

        return ResponseEntity.ok(updatedPost);
    }

    @PutMapping("/{postId}/comment/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomOAuth2User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String updatedText = payload.get("text");
        if (updatedText == null || updatedText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Comment text cannot be empty");
        }

        Post post = postService.getPostById(postId);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        Optional<Comment> optionalComment = post.getComments().stream()
                .filter(c -> c.getId() != null && c.getId().equals(commentId))
                .findFirst();

        if (!optionalComment.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Comment not found");
        }

        Comment comment = optionalComment.get();

        if (!comment.getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only the comment owner can update this comment");
        }

        Post updatedPost = postService.updateComment(postId, commentId, updatedText);
        if (updatedPost == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update comment");
        }

        return ResponseEntity.ok(updatedPost);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable String postId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomOAuth2User user) {

        System.out.println("Update Post Request:");
        System.out.println("Post ID: " + postId);
        System.out.println("User: " + (user != null ? user.getUserId() : "null"));
        System.out.println("Payload: " + payload);

        if (user == null) {
            System.out.println("Error: User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String description = payload.get("description");
        if (description == null || description.trim().isEmpty()) {
            System.out.println("Error: Description is empty");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Description cannot be empty");
        }

        try {
            Post post = postService.getPostById(postId);
            if (post == null) {
                System.out.println("Error: Post not found with ID: " + postId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
            }

            System.out.println("Post owner ID: " + post.getUserId());
            System.out.println("Current user ID: " + user.getUserId());

            if (!post.getUserId().equals(user.getUserId())) {
                System.out.println("Error: User is not the post owner");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own posts");
            }

            post.setDescription(description);
            Post updatedPost = postService.savePost(post);
            System.out.println("Post updated successfully");

            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            System.err.println("Error updating post: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating the post: " + e.getMessage());
        }
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
