package com.example.coursemanagement.controller;

import com.example.coursemanagement.model.Course;
import com.example.coursemanagement.service.CourseService;
import com.example.coursemanagement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4000", allowCredentials = "true")
public class AdminController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Course>> getDashboard() {
        try {
            List<Course> courses = courseService.getAllCourses();
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAnalytics() {
        try {
            System.out.println("Analytics endpoint called");
            Map<String, Object> analytics = new HashMap<>();
            
            // Get total users count
            long totalUsers = userService.getTotalUsers();
            analytics.put("totalUsers", totalUsers);
            
            // Get admin users count
            long adminUsers = userService.getUsersByRole("ADMIN").size();
            analytics.put("adminUsers", adminUsers);
            
            // Get normal users count
            long normalUsers = userService.getUsersByRole("USER").size();
            analytics.put("normalUsers", normalUsers);
            
            // Get users by provider
            Map<String, Long> usersByProvider = userService.getUsersByProvider();
            analytics.put("usersByProvider", usersByProvider);
            
            System.out.println("Analytics data: " + analytics);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            System.err.println("Error in analytics endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error fetching analytics: " + e.getMessage());
        }
    }
}