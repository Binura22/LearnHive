package com.example.coursemanagement.controller;

import com.example.coursemanagement.model.Course;
import com.example.coursemanagement.model.Module;
import com.example.coursemanagement.service.CourseService;
import com.example.coursemanagement.service.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private ModuleService moduleService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Course>> getDashboard() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // Courses
    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @PostMapping("/courses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Course> addCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.addCourse(course));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable String id, @RequestBody Course updatedCourse) {
        Course updated = courseService.updateCourse(id, updatedCourse);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    // Modules
    @PostMapping("/courses/{courseId}/modules")
    public ResponseEntity<Module> addModule(@PathVariable String courseId, @RequestBody Module module) {
        module.setCourseId(courseId);
        return ResponseEntity.ok(moduleService.addModule(module));
    }

    @PutMapping("/modules/{id}")
    public ResponseEntity<Module> updateModule(@PathVariable String id, @RequestBody Module updatedModule) {
        Module updated = moduleService.updateModule(id, updatedModule);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/modules/{id}")
    public ResponseEntity<Void> deleteModule(@PathVariable String id) {
        moduleService.deleteModule(id);
        return ResponseEntity.noContent().build();
        
    }

    
}