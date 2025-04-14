package com.example.coursemanagement.service;

import com.example.coursemanagement.model.Course;
import com.example.coursemanagement.model.Module;
import com.example.coursemanagement.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private ModuleService moduleService;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(String id) {
        return courseRepository.findById(id);
    }

    public void deleteCourse(String id) throws IOException {
        try {
            // Get the course to delete its image
            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            // Delete course image if exists
            if (course.getImageUrl() != null && !course.getImageUrl().isEmpty()) {
                try {
                    cloudinaryService.deleteFile(course.getImageUrl());
                } catch (IOException e) {
                    // Log error but continue with deletion
                    System.err.println("Failed to delete course image: " + e.getMessage());
                }
            }

            // Delete all modules associated with this course
            List<Module> modules = moduleService.getModulesByCourseId(id);
            if (modules != null && !modules.isEmpty()) {
                System.out.println("Found " + modules.size() + " modules to delete for course " + id);
                boolean hasModuleErrors = false;
                StringBuilder errorMessages = new StringBuilder();

                for (Module module : modules) {
                    try {
                        // Delete module and its associated files
                        moduleService.deleteModule(module.getId());
                        System.out.println("Successfully deleted module " + module.getId());
                    } catch (IOException e) {
                        hasModuleErrors = true;
                        String errorMsg = "Failed to delete module " + module.getId() + ": " + e.getMessage();
                        System.err.println(errorMsg);
                        errorMessages.append(errorMsg).append("\n");
                        // Continue with other modules even if one fails
                    }
                }

                // If we had any module deletion errors, throw an exception after course deletion
                if (hasModuleErrors) {
                    throw new IOException("Some modules could not be fully deleted:\n" + errorMessages.toString());
                }
            }

            // Finally delete the course from database
            courseRepository.deleteById(id);
            System.out.println("Successfully deleted course " + id);
        } catch (Exception e) {
            System.err.println("Error in deleteCourse: " + e.getMessage());
            throw new IOException("Failed to delete course: " + e.getMessage());
        }
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

            // Save the course
            return courseRepository.save(course);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add course: " + e.getMessage());
        }
    }

    public Course updateCourse(String id, Course courseDetails) {
        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        // Update basic course information
        existingCourse.setTitle(courseDetails.getTitle());
        existingCourse.setDescription(courseDetails.getDescription());
        existingCourse.setCategory(courseDetails.getCategory());
        existingCourse.setLevel(courseDetails.getLevel());
        existingCourse.setPublished(courseDetails.isPublished());
        existingCourse.setDuration(courseDetails.getDuration());
        
        return courseRepository.save(existingCourse);
    }

    public Course createCourseWithImage(Course course, MultipartFile imageFile) throws Exception {
        if (imageFile != null && !imageFile.isEmpty()) {
            Map<String, String> imageResult = cloudinaryService.uploadFile(imageFile);
            course.setImageUrl(imageResult.get("url"));
        }
        return courseRepository.save(course);
    }

    public Course updateCourseWithImage(String id, Course course, MultipartFile imageFile) throws Exception {
        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new Exception("Course not found"));
        
        // Update course details
        existingCourse.setTitle(course.getTitle());
        existingCourse.setDescription(course.getDescription());
        
        // Update image if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            // Delete existing image if present
            if (existingCourse.getImageUrl() != null) {
                cloudinaryService.deleteFile(existingCourse.getImageUrl());
            }
            // Upload new image
            Map<String, String> imageResult = cloudinaryService.uploadFile(imageFile);
            existingCourse.setImageUrl(imageResult.get("url"));
        }
        
        return courseRepository.save(existingCourse);
    }

    public List<Course> getCoursesByCategory(String category) {
        return courseRepository.findByCategory(category);
    }

    public List<Course> getCoursesByLevel(String level) {
        return courseRepository.findByLevel(level);
    }

    public List<Course> getPublishedCourses() {
        return courseRepository.findByPublished(true);
    }
}