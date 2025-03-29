package com.example.coursemanagement.service;

import com.example.coursemanagement.model.Course;
import com.example.coursemanagement.model.Module;
import com.example.coursemanagement.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(String id) {
        return courseRepository.findById(id).orElse(null);
    }
    
    public Course addCourse(Course course) {
        try {
            // Validate course data
            if (course.getTitle() == null || course.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Course title is required");
            }
            if (course.getDescription() == null || course.getDescription().trim().isEmpty()) {
                throw new IllegalArgumentException("Course description is required");
            }
            if (course.getModules() == null || course.getModules().isEmpty()) {
                throw new IllegalArgumentException("At least one module is required");
            }

            // Validate each module
            for (Module module : course.getModules()) {
                if (module.getTitle() == null || module.getTitle().trim().isEmpty()) {
                    throw new IllegalArgumentException("Module title is required");
                }
            }

            // Save the course
            return courseRepository.save(course);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add course: " + e.getMessage());
        }
    }

    public Course updateCourse(String id, Course updatedCourse) {
        Course existingCourse = courseRepository.findById(id).orElse(null);
        if (existingCourse != null) {
            existingCourse.setTitle(updatedCourse.getTitle());
            existingCourse.setDescription(updatedCourse.getDescription());
            existingCourse.setModules(updatedCourse.getModules());
            return courseRepository.save(existingCourse);
        }
        return null;
    }

    public void deleteCourse(String id) {
        courseRepository.deleteById(id);
    }
}