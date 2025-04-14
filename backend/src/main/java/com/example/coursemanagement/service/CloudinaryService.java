package com.example.coursemanagement.service;

import com.cloudinary.Cloudinary;
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

    public Map<String, String> uploadFile(MultipartFile file) throws IOException {
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
        
        Map<String, String> result = new HashMap<>();
        result.put("url", (String) uploadResult.get("url"));
        result.put("publicId", (String) uploadResult.get("public_id"));
        return result;
    }

    public void deleteFile(String url) throws IOException {
        if (url == null || url.isEmpty()) {
            return;
        }

        try {

            String[] urlParts = url.split("/upload/");
            if (urlParts.length != 2) {
                System.err.println("Invalid Cloudinary URL format: " + url);
                return;
            }

            // Get the part after /upload/
            String path = urlParts[1];
            // Remove version number 
            if (path.matches("v\\d+/.*")) {
                path = path.replaceFirst("v\\d+/", "");
            }
            // Remove file extension if present
            String publicId = path;
            if (path.contains(".")) {
                publicId = path.substring(0, path.lastIndexOf('.'));
            }

            // Determine resource type from URL
            String resourceType = "image";
            if (url.contains("/video/")) {
                resourceType = "video";
            } else if (url.contains("/raw/")) {
                resourceType = "raw";
            }

            System.out.println("Deleting file from Cloudinary: publicId=" + publicId + ", resourceType=" + resourceType);
            
            Map<String, Object> options = new HashMap<>();
            options.put("resource_type", resourceType);
            
            cloudinary.uploader().destroy(publicId, options);
            System.out.println("Successfully deleted file from Cloudinary: " + publicId);
        } catch (Exception e) {
            String errorMessage = "Failed to delete file from Cloudinary: " + e.getMessage();
            System.err.println(errorMessage);
            throw new IOException(errorMessage, e);
        }
    }
} 