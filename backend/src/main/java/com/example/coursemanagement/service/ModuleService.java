package com.example.coursemanagement.service;

import com.example.coursemanagement.model.Module;
import com.example.coursemanagement.repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

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
            String videoUrl = cloudinaryService.uploadImage(videoFile);
            module.setVideoLink(videoUrl);
        }

        if (pdfFile != null && !pdfFile.isEmpty()) {
            String pdfUrl = cloudinaryService.uploadImage(pdfFile);
            module.setPdfLink(pdfUrl);
        }

        return addModule(module);
    }

    public Module updateModuleWithFiles(String id, Module updatedModule, MultipartFile videoFile, MultipartFile pdfFile) throws IOException {
        Module existingModule = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found"));

        // Update basic module information
        existingModule.setTitle(updatedModule.getTitle());
        existingModule.setDescription(updatedModule.getDescription());
        existingModule.setOrderIndex(updatedModule.getOrderIndex());

        // Upload and update video if provided
        if (videoFile != null && !videoFile.isEmpty()) {
            String videoUrl = cloudinaryService.uploadImage(videoFile);
            existingModule.setVideoLink(videoUrl);
        }

        // Upload and update PDF if provided
        if (pdfFile != null && !pdfFile.isEmpty()) {
            String pdfUrl = cloudinaryService.uploadImage(pdfFile);
            existingModule.setPdfLink(pdfUrl);
        }

        return moduleRepository.save(existingModule);
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

    public void deleteModule(String id) {
        moduleRepository.deleteById(id);
    }
}