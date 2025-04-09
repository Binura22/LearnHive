package com.example.coursemanagement.controller;

import com.example.coursemanagement.model.Course;
import com.example.coursemanagement.model.Module;
import com.example.coursemanagement.service.CourseService;
import com.example.coursemanagement.service.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private ModuleService moduleService;

    // Courses
    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // Modules
    @GetMapping("/courses/{courseId}/modules")
    public ResponseEntity<List<Module>> getModulesByCourseId(@PathVariable String courseId) {
        return ResponseEntity.ok(moduleService.getModulesByCourseId(courseId));
    }
}