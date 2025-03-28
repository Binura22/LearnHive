package com.example.coursemanagement.repository;

import com.example.coursemanagement.model.Module;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface ModuleRepository extends MongoRepository<Module, String> {

    @Query("{ 'courseId': ?0 }")
    List<Module> findByCourseId(String courseId);
}