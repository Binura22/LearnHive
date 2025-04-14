package com.example.coursemanagement.service;

import com.example.coursemanagement.model.Module;
import com.example.coursemanagement.repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class ModuleService {

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<Module> getModulesByCourseId(String courseId) {
        return moduleRepository.findByCourseId(courseId);
    }

    public Module addModule(Module module) {
        if (module.getCourseId() == null || module.getCourseId().trim().isEmpty()) {
            throw new IllegalArgumentException("Course ID is required");
        }
        if (module.getTitle() == null || module.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Module title is required");
        }
        return moduleRepository.save(module);
    }

    public Module addModuleWithFiles(Module module, MultipartFile videoFile, MultipartFile pdfFile) throws IOException {
        // Upload files to Cloudinary if provided
        if (videoFile != null && !videoFile.isEmpty()) {
            Map<String, String> videoResult = cloudinaryService.uploadFile(videoFile);
            module.setVideoLink(videoResult.get("url"));
        }

        if (pdfFile != null && !pdfFile.isEmpty()) {
            Map<String, String> pdfResult = cloudinaryService.uploadFile(pdfFile);
            module.setPdfLink(pdfResult.get("url"));
        }

        return addModule(module);
    }

    public Module updateModuleWithFiles(String id, Module updatedModule, MultipartFile videoFile, MultipartFile pdfFile) throws IOException {
        // Validate input
        if (id == null || updatedModule == null) {
            throw new IllegalArgumentException("Module ID and updated module data are required");
        }

        // Find existing module
        Module existingModule = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + id));

        System.out.println("Updating module " + id + ". Current data: " + existingModule);
        System.out.println("New data: " + updatedModule);

        // Preserve existing orderIndex if new one is not provided or is invalid
        int newOrderIndex = updatedModule.getOrderIndex();
        if (newOrderIndex < 0) {
            newOrderIndex = existingModule.getOrderIndex();
        }
        existingModule.setOrderIndex(newOrderIndex);

        // Update title if provided and not empty
        String newTitle = updatedModule.getTitle();
        if (newTitle != null && !newTitle.trim().isEmpty()) {
            existingModule.setTitle(newTitle.trim());
        }

        // Update description if provided and not empty
        String newDescription = updatedModule.getDescription();
        if (newDescription != null && !newDescription.trim().isEmpty()) {
            existingModule.setDescription(newDescription.trim());
        }

        // Update video link if provided and not empty
        String newVideoLink = updatedModule.getVideoLink();
        if (newVideoLink != null && !newVideoLink.trim().isEmpty()) {
            existingModule.setVideoLink(newVideoLink.trim());
        }

        // Update PDF link if provided and not empty
        String newPdfLink = updatedModule.getPdfLink();
        if (newPdfLink != null && !newPdfLink.trim().isEmpty()) {
            existingModule.setPdfLink(newPdfLink.trim());
        }

        // Handle video file update
        if (videoFile != null && !videoFile.isEmpty()) {
            try {
                // Delete existing video if present
                if (existingModule.getVideoLink() != null && !existingModule.getVideoLink().isEmpty()) {
                    try {
                        cloudinaryService.deleteFile(existingModule.getVideoLink());
                    } catch (Exception e) {
                        System.err.println("Warning: Failed to delete existing video: " + e.getMessage());
                    }
                }
                // Upload new video
                Map<String, String> videoResult = cloudinaryService.uploadFile(videoFile);
                existingModule.setVideoLink(videoResult.get("url"));
            } catch (Exception e) {
                throw new IOException("Failed to process video file: " + e.getMessage());
            }
        }

        // Handle PDF file update
        if (pdfFile != null && !pdfFile.isEmpty()) {
            try {
                // Delete existing PDF if present
                if (existingModule.getPdfLink() != null && !existingModule.getPdfLink().isEmpty()) {
                    try {
                        cloudinaryService.deleteFile(existingModule.getPdfLink());
                    } catch (Exception e) {
                        System.err.println("Warning: Failed to delete existing PDF: " + e.getMessage());
                    }
                }
                // Upload new PDF
                Map<String, String> pdfResult = cloudinaryService.uploadFile(pdfFile);
                existingModule.setPdfLink(pdfResult.get("url"));
            } catch (Exception e) {
                throw new IOException("Failed to process PDF file: " + e.getMessage());
            }
        }

        // Save and return updated module
        try {
            Module savedModule = moduleRepository.save(existingModule);
            System.out.println("Successfully updated module: " + savedModule);
            return savedModule;
        } catch (Exception e) {
            throw new RuntimeException("Failed to save updated module: " + e.getMessage());
        }
    }

    public Module updateModule(String id, Module updatedModule) {
        Module existingModule = moduleRepository.findById(id).orElse(null);
        if (existingModule != null) {
            existingModule.setTitle(updatedModule.getTitle());
            existingModule.setDescription(updatedModule.getDescription());
            existingModule.setVideoLink(updatedModule.getVideoLink());
            existingModule.setPdfLink(updatedModule.getPdfLink());
            return moduleRepository.save(existingModule);
        }
        return null;
    }

    public void deleteModule(String id) throws IOException {
        try {
            // Get the module to access its file URLs before deletion
            Module module = moduleRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Module not found"));

            System.out.println("Deleting module " + id + " for course " + module.getCourseId());

            boolean hasErrors = false;

            // Delete video file from Cloudinary if exists
            if (module.getVideoLink() != null && !module.getVideoLink().isEmpty()) {
                try {
                    cloudinaryService.deleteFile(module.getVideoLink());
                    System.out.println("Successfully deleted video file for module " + id);
                } catch (IOException e) {
                    System.err.println("Failed to delete video file for module " + id + ": " + e.getMessage());
                    hasErrors = true;
                }
            }

            // Delete PDF file from Cloudinary if exists
            if (module.getPdfLink() != null && !module.getPdfLink().isEmpty()) {
                try {
                    cloudinaryService.deleteFile(module.getPdfLink());
                    System.out.println("Successfully deleted PDF file for module " + id);
                } catch (IOException e) {
                    System.err.println("Failed to delete PDF file for module " + id + ": " + e.getMessage());
                    hasErrors = true;
                }
            }

            // Finally delete the module from database
            try {
                moduleRepository.deleteById(id);
                System.out.println("Successfully deleted module " + id + " from database");
            } catch (Exception e) {
                String errorMsg = "Failed to delete module from database: " + e.getMessage();
                System.err.println(errorMsg);
                throw new IOException(errorMsg);
            }

            // If we had errors deleting files but successfully deleted from database,
            // still throw an exception to notify the caller
            if (hasErrors) {
                throw new IOException("Module was deleted from database but some files could not be deleted from cloud storage");
            }
        } catch (Exception e) {
            throw new IOException("Failed to delete module: " + e.getMessage());
        }
    }
}