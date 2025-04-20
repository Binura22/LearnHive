package com.example.coursemanagement.service;

import com.example.coursemanagement.model.Post;
import com.example.coursemanagement.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.coursemanagement.model.Comment;
import java.util.Optional;

import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    public Post savePost(Post post) {
        return postRepository.save(post);
    }

    public List<Post> getUserPosts(String userId) {
        return postRepository.findByUserId(userId);
    }
    
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }
    

    public void deletePost(String postId) {
        postRepository.deleteById(postId);
    }

    // for like and comment
    public Post findById(String postId) {
        return postRepository.findById(postId).orElse(null);
    }

    public Post addCommentToPost(String postId, Comment comment) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
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

}
