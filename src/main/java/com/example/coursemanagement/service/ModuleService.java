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
}