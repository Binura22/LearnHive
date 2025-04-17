package com.example.coursemanagement.service;

import com.example.coursemanagement.config.CustomOAuth2User;
import com.example.coursemanagement.model.User;
import com.example.coursemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;
    
    // List of admin emails - you can also load this from application.properties
    private final List<String> adminEmails = Arrays.asList(
        "binura903@gmail.com.com"
           
    );

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email;
        String name;
        String role;

        if (provider.equals("google")) {
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
        } else if (provider.equals("github")) {
            email = (String) attributes.get("email");
            if (email == null) {
                // GitHub might not provide email in the initial response
                email = (String) attributes.get("login") + "@github.com";
            }
            name = (String) attributes.get("name");
            if (name == null) {
                name = (String) attributes.get("login");
            }
        } else {
            throw new OAuth2AuthenticationException("Unsupported provider: " + provider);
        }

        // Check if user exists in database
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            // Update user information if needed
            user.setName(name);
            user.setProvider(provider);
            // Keep existing role
            role = user.getRole();
        } else {
            // Create new user
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setProvider(provider);
            
            // Check if the email is in the admin list
            if (adminEmails.contains(email)) {
                role = "ADMIN";
            } else {
                role = "USER"; // Default role
            }
            user.setRole(role);
        }

        userRepository.save(user);

        return new CustomOAuth2User(oAuth2User, user.getRole());
    }
}