package com.example.coursemanagement.repository;

import com.example.coursemanagement.model.Module;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ModuleRepository extends MongoRepository<Module, String> {
    List<Module> findByCourseId(String courseId);
}