package com.example.coursemanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.coursemanagement.config.CustomOAuth2User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/check-role")
    public ResponseEntity<?> checkRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            Object principal = auth.getPrincipal();

            if (principal instanceof CustomOAuth2User) {
                CustomOAuth2User customUser = (CustomOAuth2User) principal;

                boolean isAdmin = customUser.getRole().equalsIgnoreCase("ADMIN");

                response.put("authenticated", true);
                response.put("userId", customUser.getUserId());
                response.put("username", customUser.getEmail()); // Or getName() if you prefer full name
                response.put("roles", List.of(customUser.getRole()));
                response.put("isAdmin", isAdmin);
                response.put("redirectUrl", isAdmin ? "/admin/dashboard" : "/main");

                return ResponseEntity.ok(response);
            }
        }

        response.put("authenticated", false);
        response.put("redirectUrl", "/login");
        return ResponseEntity.ok(response);
    }

}