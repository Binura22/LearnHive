package com.example.coursemanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "posts")
public class Post {

    @Id
    private String id;
    private String description;
    private List<String> mediaUrls;
    private String userEmail; // From authenticated user
    private long createdAt = System.currentTimeMillis();
    public void setMediaUrls(List<String> urls) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setMediaUrls'");
    }
    public void setDescription(String description2) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setDescription'");
    }
    public void setUserEmail(Object attribute) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setUserEmail'");
    }

    // Getters and Setters
}
