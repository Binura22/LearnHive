package com.example.coursemanagement.service;

import com.example.coursemanagement.config.CustomOAuth2User;
import com.example.coursemanagement.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class OAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserService userService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oauth2User.getAttributes();
        
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String providerId = (String) attributes.get("sub");
        String provider = userRequest.getClientRegistration().getRegistrationId();

        // Create or update user in database
        User user = userService.createOrUpdateOAuthUser(email, name, provider, providerId);

        // Create a custom OAuth2User with the user's role
        return new CustomOAuth2User(oauth2User, user.getRole());
    }
} 