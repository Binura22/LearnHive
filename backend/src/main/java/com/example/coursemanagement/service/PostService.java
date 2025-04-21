package com.example.coursemanagement.service;

import com.example.coursemanagement.model.Post;
import com.example.coursemanagement.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.coursemanagement.model.Comment;
import java.util.Optional;
import java.util.UUID;

import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    public Post savePost(Post post) {
        return postRepository.save(post);
    }

    public List<Post> getUserPosts(String email) {
        return postRepository.findByUserEmail(email);
    }

    public void deletePost(String postId) {
        postRepository.deleteById(postId);
    }

    public Post findById(String postId) {
        return postRepository.findById(postId).orElse(null);
    }

    public Post addCommentToPost(String postId, Comment comment) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();

            if (comment.getId() == null || comment.getId().trim().isEmpty()) {
                String newId = UUID.randomUUID().toString();
                System.out.println("Generated new ID for comment: " + newId);
                comment.setId(newId);
            } else {
                System.out.println("Comment already has ID: " + comment.getId());
            }

            for (Comment existingComment : post.getComments()) {
                if (existingComment.getId() == null || existingComment.getId().trim().isEmpty()) {
                    existingComment.setId(UUID.randomUUID().toString());
                    System.out.println("Fixed missing ID for existing comment");
                }
            }

            post.getComments().add(comment);
            return postRepository.save(post);
        }
        return null;
    }

    // for get all posts
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Post getPostById(String postId) {
        return postRepository.findById(postId).orElse(null);
    }

    public Post deleteCommentByIndex(String postId, int commentIndex) {
        Post post = getPostById(postId);
        if (post != null) {
            List<Comment> comments = post.getComments();
            if (commentIndex >= 0 && commentIndex < comments.size()) {
                comments.remove(commentIndex);
                post.setComments(comments);
                return savePost(post);
            }
        }
        return null;
    }

}
