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
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email;
        String name;

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

        String providerId = oAuth2User.getName();
        User user = userService.createOrUpdateOAuthUser(email, name, provider, providerId);

        return new CustomOAuth2User(oAuth2User, user);
    }
}