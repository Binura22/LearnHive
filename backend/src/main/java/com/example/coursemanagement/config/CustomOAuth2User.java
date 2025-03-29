package com.example.coursemanagement.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User oAuth2User;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomOAuth2User(OAuth2User oAuth2User, Collection<? extends GrantedAuthority> authorities) {
        this.oAuth2User = oAuth2User;
        this.authorities = authorities;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oAuth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getName() {
        return oAuth2User.getAttribute("name"); // Adjust based on OAuth provider
    }

    public String getEmail() {
        return oAuth2User.getAttribute("email"); // Custom method to get email
    }
}
