package com.example.coursemanagement.repository;

import com.example.coursemanagement.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientEmailOrderByTimestampDesc(String recipientEmail);

    long countByRecipientEmailAndIsReadFalse(String recipientEmail);
}
