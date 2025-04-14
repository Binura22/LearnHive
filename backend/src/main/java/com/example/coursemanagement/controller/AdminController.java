package com.example.coursemanagement.controller;

import com.example.coursemanagement.model.Course;
import com.example.coursemanagement.model.Module;
import com.example.coursemanagement.service.CourseService;
import com.example.coursemanagement.service.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private ModuleService moduleService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Course>> getDashboard() {
        try {
            List<Course> courses = courseService.getAllCourses();
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Courses
    @GetMapping("/courses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/courses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCourseById(@PathVariable String id) {
        try {
            Course course = courseService.getCourseById(id)
                .orElseThrow(() -> new Exception("Course not found"));
            
            // Get modules for this course
            List<Module> modules = moduleService.getModulesByCourseId(id);
            course.setModules(modules);
            
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to get course: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/courses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addCourse(@RequestBody Course course) {
        try {
            Course savedCourse = courseService.addCourse(course);
            return ResponseEntity.ok(savedCourse);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to add course: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PutMapping("/courses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCourse(@PathVariable String id, @RequestBody Course updatedCourse) {
        try {
            Course updated = courseService.updateCourse(id, updatedCourse);
            if (updated == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to update course: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable String id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete course files: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete course: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/courses/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadCourseImage(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            Course course = courseService.getCourseById(id)
                .orElseThrow(() -> new Exception("Course not found"));
            
            Course updatedCourse = courseService.updateCourseWithImage(id, course, file);
            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // Modules
    @PostMapping("/courses/{courseId}/modules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addModule(
            @PathVariable String courseId,
            @RequestPart("module") Module module,
            @RequestPart(value = "video", required = false) MultipartFile videoFile,
            @RequestPart(value = "pdf", required = false) MultipartFile pdfFile) {
        try {
            module.setCourseId(courseId);
            Module savedModule = moduleService.addModuleWithFiles(module, videoFile, pdfFile);
            return ResponseEntity.ok(savedModule);
        } catch (IllegalArgumentException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to add module: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PutMapping("/modules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateModule(
            @PathVariable String id,
            @RequestPart("module") Module updatedModule,
            @RequestPart(value = "video", required = false) MultipartFile videoFile,
            @RequestPart(value = "pdf", required = false) MultipartFile pdfFile) {
        try {
            Module updated = moduleService.updateModuleWithFiles(id, updatedModule, videoFile, pdfFile);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to update module: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/modules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteModule(@PathVariable String id) {
        try {
            moduleService.deleteModule(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete module: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}