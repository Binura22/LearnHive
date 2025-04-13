package com.example.coursemanagement.service;

import com.example.coursemanagement.model.User;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

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
                // Update existing user
                user.setName(name);
                user.setProvider(provider);
                user.setProviderId(providerId);
                return userRepository.save(user);
            })
            .orElseGet(() -> {
                // Create new user
                User newUser = new User(email, name, "USER", provider, providerId);
                return userRepository.save(newUser);
            });
    }

    public User createLocalUser(String email, String name, String password, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User(email, name, role, "LOCAL", null);
        return userRepository.save(user);
    }
} 