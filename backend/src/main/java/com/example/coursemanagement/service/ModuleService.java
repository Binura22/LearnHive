package com.example.coursemanagement.service;

import com.example.coursemanagement.model.Module;
import com.example.coursemanagement.repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleService {

    @Autowired
    private ModuleRepository moduleRepository;

    public List<Module> getModulesByCourseId(String courseId) {
        return moduleRepository.findByCourseId(courseId);
    }

    public Module addModule(Module module) {
        return moduleRepository.save(module);
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