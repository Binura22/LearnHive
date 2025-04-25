package com.example.coursemanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.coursemanagement.config.CustomOAuth2User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4000", allowCredentials = "true")
public class AuthController {

    @GetMapping("/check-role")
    public ResponseEntity<?> checkRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            Object principal = auth.getPrincipal();

            // Handle CustomOAuth2User
            if (principal instanceof CustomOAuth2User) {
                CustomOAuth2User customUser = (CustomOAuth2User) principal;
                boolean isAdmin = customUser.getRole().equalsIgnoreCase("ADMIN");

                response.put("authenticated", true);
                response.put("userId", customUser.getUserId());
                response.put("username", customUser.getEmail());
                response.put("roles", List.of(customUser.getRole()));
                response.put("isAdmin", isAdmin);
                response.put("redirectUrl", isAdmin ? "/admin/dashboard" : "/main");
                return ResponseEntity.ok(response);
            } else {
                // Handle generic OAuth2User
                boolean isAdmin = auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                String[] roles = auth.getAuthorities().stream()
                        .map(grantedAuthority -> {
                            String authority = grantedAuthority.getAuthority();
                            return authority.startsWith("ROLE_") ? authority.substring(5) : authority;
                        })
                        .toArray(String[]::new);

                response.put("authenticated", true);
                response.put("isAdmin", isAdmin);
                response.put("username", auth.getName());
                response.put("roles", roles);
                response.put("redirectUrl", isAdmin ? "/admin/dashboard" : "/main");
                return ResponseEntity.ok(response);
            }
        }

        response.put("authenticated", false);
        response.put("redirectUrl", "/login");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();

        if (auth != null && auth.isAuthenticated() && !(auth.getPrincipal() instanceof String)) {
            if (auth.getPrincipal() instanceof CustomOAuth2User) {
                CustomOAuth2User customUser = (CustomOAuth2User) auth.getPrincipal();
                response.put("email", customUser.getEmail());
                response.put("userId", customUser.getUserId()); // Ensure userId is included
                response.put("name", customUser.getName());
            }
            return ResponseEntity.ok(response);
        }

        response.put("error", "User not authenticated");
        return ResponseEntity.status(401).body(response);
    }
}