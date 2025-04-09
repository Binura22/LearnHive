package com.example.coursemanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/check-role")
    public ResponseEntity<?> checkRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            response.put("authenticated", true);
            response.put("isAdmin", isAdmin);
            response.put("username", auth.getName());
            response.put("redirectUrl", isAdmin ? "/admin/dashboard" : "/main");
            
            return ResponseEntity.ok(response);
        }
        
        response.put("authenticated", false);
        response.put("redirectUrl", "/login");
        return ResponseEntity.ok(response);
    }
} 