package com.example.coursemanagement.service;

import com.example.coursemanagement.model.Notification;
import com.example.coursemanagement.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getUserNotifications(String userEmail) {
        return notificationRepository.findByRecipientEmailOrderByTimestampDesc(userEmail);
    }

    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public void markAllAsRead(String userEmail) {
        List<Notification> notifications = notificationRepository.findByRecipientEmailOrderByTimestampDesc(userEmail);
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
            }
        }
        notificationRepository.saveAll(notifications);
    }

    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }
}
