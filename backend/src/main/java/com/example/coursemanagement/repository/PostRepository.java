package com.example.coursemanagement.repository;

import com.example.coursemanagement.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByUserEmail(String email);
}
