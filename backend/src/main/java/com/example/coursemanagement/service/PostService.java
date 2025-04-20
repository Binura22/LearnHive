package com.example.coursemanagement.service;

import com.example.coursemanagement.model.Post;
import com.example.coursemanagement.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
