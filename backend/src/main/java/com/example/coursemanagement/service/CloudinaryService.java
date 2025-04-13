package com.example.coursemanagement.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        Map<String, Object> options = new HashMap<>();
        
        if (contentType != null) {
            if (contentType.startsWith("video/")) {
                options.put("resource_type", "video");
            } else if (contentType.equals("application/pdf")) {
                options.put("resource_type", "raw");
            }
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(), options);
        return (String) uploadResult.get("url");
    }

    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
} 