package com.example.coursemanagement.controller;

import com.example.coursemanagement.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class UserController {

    @Autowired
    private CourseService courseService;

    @GetMapping("/courses/view-all")
    public String viewAllCourses(Model model) {
        model.addAttribute("courses", courseService.getAllCourses());
        return "view-courses";
    }

    @GetMapping("/courses/view/{id}")
    public String viewCourse(@PathVariable String id, Model model) {
        model.addAttribute("course", courseService.getCourseById(id));
        return "view-course";
    }
}