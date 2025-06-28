package com.example.coursemanagement.repository;

import com.example.coursemanagement.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    Optional<User> findByProviderId(String providerId);

    boolean existsByEmail(String email);

    Optional<User> findById(String userId);

    List<User> findByIdIn(List<String> userIds);

    List<User> findByRole(String role);
}