package com.example.coursemanagement.service;

import com.example.coursemanagement.model.User;
import com.example.coursemanagement.repository.UserRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private MongoTemplate mongoTemplate;

    private final List<String> adminEmails = Arrays.asList(
            "binura903@gmail.com.com"

    );

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password("") // No password for OAuth users
                .roles(user.getRole())
                .build();
    }

    public User createOrUpdateOAuthUser(String email, String name, String provider, String providerId) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    System.out.println("I'm a existing user");
                    // Update existing user
                    user.setName(name);
                    user.setProvider(provider);
                    user.setProviderId(providerId);
                    return userRepository.save(user);
                })
                .orElseGet(() -> {
                    // New user: set all fields
                    System.out.println("I'm a new user");
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setProvider(provider);
                    newUser.setProviderId(providerId);
                    newUser.setRegistrationDate(LocalDateTime.now());

                    // Defaults
                    newUser.setBio(null);
                    newUser.setProfileImage(null);
                    newUser.setCoverImage(null);
                    newUser.setProfileCompleted(false);

                    // Role logic
                    if (adminEmails.contains(email)) {
                        newUser.setRole("ADMIN");
                    } else {
                        newUser.setRole("USER");
                    }
                    return userRepository.save(newUser);
                });
    }

    // For local user registration
    public User createLocalUser(String email, String name, String password, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setRole(role);
        user.setProvider("LOCAL");
        user.setProviderId(null);
        user.setRegistrationDate(LocalDateTime.now());

        // Defaults
        user.setBio("");
        user.setProfileImage("");
        user.setCoverImage("");
        user.setProfileCompleted(false);

        return userRepository.save(user);
    }

    // update bio, profile image, or cover image
    public User updateUserProfile(String email,
            String bio,
            MultipartFile profileImageFile,
            MultipartFile coverImageFile) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (profileImageFile == null) {
            System.out.println("Profile pic is null");
        }
        if (profileImageFile != null && profileImageFile.isEmpty()) {
            System.out.println("profile pic is empty");
        }
        if (bio != null)
            user.setBio(bio);
        if (profileImageFile != null && !profileImageFile.isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadFile(profileImageFile);
            user.setProfileImage(uploadResult.get("url"));
        }
        if (coverImageFile != null && !coverImageFile.isEmpty()) {
            Map<String, String> uploadResult = cloudinaryService.uploadFile(coverImageFile);
            user.setCoverImage(uploadResult.get("url"));
        }

        // Check if profile is now completed
        if (user.getBio() != null && !user.getBio().isBlank() &&
                user.getProfileImage() != null && !user.getProfileImage().isBlank()
                && !user.getProfileImage().isEmpty()) {
            user.setProfileCompleted(true);
        } else {
            user.setProfileCompleted(false);
        }

        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public boolean isProfileCompleted(String email) {
        User user = findByEmail(email);
        return user.isProfileCompleted();
    }

    public void deleteUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        userRepository.delete(user);
    }

    public Optional<User> getOptionalUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getOptionalUserByProviderId(String providerId) {
        return userRepository.findByProviderId(providerId);
    }

    public Optional<User> getOptionalUserByProvider(String provider, String providerId) {
        return userRepository.findByProviderAndProviderId(provider, providerId);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    // Post Interactions
    public void addPostToUser(String userId, String postId) {
        Query query = new Query(Criteria.where("_id").is(userId));
        Update update = new Update().addToSet("postIds", postId);
        mongoTemplate.updateFirst(query, update, User.class);
    }

    public void removePostFromUser(String userId, String postId) {
        Query query = new Query(Criteria.where("_id").is(userId));
        Update update = new Update().pull("postIds", postId);
        mongoTemplate.updateFirst(query, update, User.class);
    }

    // Like Interactions
    public void likePost(String userId, String postId) {
        Query query = new Query(Criteria.where("_id").is(userId));
        Update update = new Update().addToSet("likedPostIds", postId);
        mongoTemplate.updateFirst(query, update, User.class);
    }

    public void unlikePost(String userId, String postId) {
        Query query = new Query(Criteria.where("_id").is(userId));
        Update update = new Update().pull("likedPostIds", postId);
        mongoTemplate.updateFirst(query, update, User.class);
    }

    // Comment Interactions
    public void addCommentToUser(String userId, String commentId) {
        Query query = new Query(Criteria.where("_id").is(userId));
        Update update = new Update().addToSet("commentIds", commentId);
        mongoTemplate.updateFirst(query, update, User.class);
    }

    public void removeCommentFromUser(String userId, String commentId) {
        Query query = new Query(Criteria.where("_id").is(userId));
        Update update = new Update().pull("commentIds", commentId);
        mongoTemplate.updateFirst(query, update, User.class);
    }

    // Follow/Unfollow Interactions
    public void followUser(String userId, String targetUserId) {
        // Add target to current user's following
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(userId)),
                new Update().addToSet("following", targetUserId),
                User.class);

        // Add current user to target's followers
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(targetUserId)),
                new Update().addToSet("followers", userId),
                User.class);
    }

    public void unfollowUser(String userId, String targetUserId) {
        // Remove target from current user's following
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(userId)),
                new Update().pull("following", targetUserId),
                User.class);

        // Remove current user from target's followers
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("_id").is(targetUserId)),
                new Update().pull("followers", userId),
                User.class);
    }

    public List<User> getFollowers(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return userRepository.findAllById(user.getFollowers());
    }

    public List<User> getFollowing(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return userRepository.findAllById(user.getFollowing());
    }

    public List<User> getUsersByIds(List<String> userIds) {
        return userRepository.findByIdIn(userIds);
    }

    public long getTotalUsers() {
        return userRepository.count();
    }

    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    public Map<String, Long> getUsersByProvider() {
        List<User> allUsers = userRepository.findAll();
        Map<String, Long> providerCount = new HashMap<>();
        
        for (User user : allUsers) {
            String provider = user.getProvider() != null ? user.getProvider() : "LOCAL";
            providerCount.merge(provider, 1L, Long::sum);
        }
        
        return providerCount;
    }

}