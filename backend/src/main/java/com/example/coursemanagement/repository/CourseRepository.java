package com.example.coursemanagement.repository;

import com.example.coursemanagement.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends MongoRepository<Course, String> {
    List<Course> findByCategory(String category);
    List<Course> findByLevel(String level);
    List<Course> findByInstructor(String instructor);
    List<Course> findByPublished(boolean published);
}