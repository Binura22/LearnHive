package com.example.coursemanagement.repository;

import com.example.coursemanagement.model.Module;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ModuleRepository extends MongoRepository<Module, String> {
}