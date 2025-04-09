package com.example.coursemanagement.repository;

import com.example.coursemanagement.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    Optional<User> findByProviderId(String providerId);
    boolean existsByEmail(String email);
} 