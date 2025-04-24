package com.example.coursemanagement.controller;

import com.example.coursemanagement.model.Notification;
import com.example.coursemanagement.repository.NotificationRepository;
import com.example.coursemanagement.service.NotificationService;
import com.example.coursemanagement.config.CustomOAuth2User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4000", allowCredentials = "true")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal CustomOAuth2User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        String email = user.getAttribute("email");
        List<Notification> notifications = notificationRepository.findByRecipientEmailOrderByTimestampDesc(email);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal CustomOAuth2User user) {
        if (user == null)
            return ResponseEntity.status(401).build();
        String email = user.getAttribute("email");
        long count = notificationRepository.countByRecipientEmailAndIsReadFalse(email);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{id}/mark-read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        Optional<Notification> notification = notificationRepository.findById(id);
        if (notification.isPresent()) {
            Notification n = notification.get();
            n.setRead(true);
            notificationRepository.save(n);
            return ResponseEntity.ok("Marked as read");
        } else {
            return ResponseEntity.status(404).body("Notification not found");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return ResponseEntity.ok("Deleted");
        } else {
            return ResponseEntity.status(404).body("Notification not found");
        }
    }

    @PutMapping("/markAsRead")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String userEmail = principal.getAttribute("email");
        notificationService.markAllAsRead(userEmail);
        return ResponseEntity.ok("All notifications marked as read");
    }

}
