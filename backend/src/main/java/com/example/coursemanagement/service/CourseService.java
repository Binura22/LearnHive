package com.example.coursemanagement.service;

import com.example.coursemanagement.model.Course;
import com.example.coursemanagement.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(String id) {
        return courseRepository.findById(id);
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
        existingCourse.setInstructor(courseDetails.getInstructor());
        existingCourse.setPublished(courseDetails.isPublished());
        existingCourse.setDuration(courseDetails.getDuration());
        
        return courseRepository.save(existingCourse);
    }

    public void deleteCourse(String id) {
        courseRepository.deleteById(id);
    }

    public Course createCourseWithImage(Course course, MultipartFile imageFile) throws Exception {
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(imageFile);
            course.setImageUrl(imageUrl);
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
            String imageUrl = cloudinaryService.uploadImage(imageFile);
            existingCourse.setImageUrl(imageUrl);
        }
        
        return courseRepository.save(existingCourse);
    }

    public List<Course> getCoursesByCategory(String category) {
        return courseRepository.findByCategory(category);
    }

    public List<Course> getCoursesByLevel(String level) {
        return courseRepository.findByLevel(level);
    }

    public List<Course> getCoursesByInstructor(String instructor) {
        return courseRepository.findByInstructor(instructor);
    }

    public List<Course> getPublishedCourses() {
        return courseRepository.findByPublished(true);
    }
}