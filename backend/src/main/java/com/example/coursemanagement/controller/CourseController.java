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
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private ModuleService moduleService;

    // Public Endpoints

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/published")
    public ResponseEntity<List<Course>> getPublishedCourses() {
        return ResponseEntity.ok(courseService.getPublishedCourses());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Course>> getCoursesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(courseService.getCoursesByCategory(category));
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<List<Course>> getCoursesByLevel(@PathVariable String level) {
        return ResponseEntity.ok(courseService.getCoursesByLevel(level));
    }

    // Admin Endpoints

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addCourse(@RequestBody Course course) {
        try {
            Course savedCourse = courseService.addCourse(course);
            return ResponseEntity.ok(savedCourse);
        } catch (IllegalArgumentException e) {
            return handleErrorResponse(e.getMessage(), "Invalid input");
        } catch (Exception e) {
            return handleErrorResponse(e.getMessage(), "Failed to add course");
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCourse(@PathVariable String id, @RequestBody Course updatedCourse) {
        try {
            Course updated = courseService.updateCourse(id, updatedCourse);
            if (updated == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return handleErrorResponse(e.getMessage(), "Failed to update course");
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable String id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return handleErrorResponse(e.getMessage(), "Failed to delete course files");
        } catch (Exception e) {
            return handleErrorResponse(e.getMessage(), "Failed to delete course");
        }
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadCourseImage(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            Course course = courseService.getCourseById(id)
                    .orElseThrow(() -> new Exception("Course not found"));
            Course updatedCourse = courseService.updateCourseWithImage(id, course, file);
            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            return handleErrorResponse(e.getMessage(), "Failed to upload image");
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCourseById(@PathVariable String id) {
        try {
            Course course = courseService.getCourseById(id)
                    .orElseThrow(() -> new Exception("Course not found"));
            List<Module> modules = moduleService.getModulesByCourseId(id);
            course.setModules(modules);
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            return handleErrorResponse(e.getMessage(), "Failed to get course");
        }
    }

    // Module Endpoints

    @PostMapping("/{courseId}/modules")
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
            return handleErrorResponse(e.getMessage(), "Invalid input");
        } catch (Exception e) {
            return handleErrorResponse(e.getMessage(), "Failed to add module");
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
            return handleErrorResponse(e.getMessage(), "Failed to delete module");
        }
    }

    // Helper Method for Error Handling
    private ResponseEntity<Map<String, String>> handleErrorResponse(String message, String errorType) {
        Map<String, String> response = new HashMap<>();
        response.put("error", errorType + ": " + message);
        return ResponseEntity.internalServerError().body(response);
    }
}