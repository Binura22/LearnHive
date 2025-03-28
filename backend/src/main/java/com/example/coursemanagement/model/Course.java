package com.example.coursemanagement.model;

import org.springframework.data.annotation.Id;
import java.util.List;

public class Course {

    @Id
    private String id;
    private String title;
    private String description;
    private List<Module> modules;

    // Constructors, Getters, and Setters
    public Course() {}

    public Course(String title, String description, List<Module> modules) {
        this.title = title;
        this.description = description;
        this.modules = modules;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Module> getModules() {
        return modules;
    }

    public void setModules(List<Module> modules) {
        this.modules = modules;
    }
}