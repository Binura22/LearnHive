package com.example.coursemanagement.repository;

import com.example.coursemanagement.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CourseRepository extends MongoRepository<Course, String> {
    // Custom query methods if needed
}