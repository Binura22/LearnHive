package com.example.coursemanagement.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "courses")
public class Course {

    @Id
    private String id;
    private String title;
    private String description;
    private String instructor;
    private List<Module> modules;

    // Default Constructor
    public Course() {}

    // Parameterized Constructor
    public Course(String title, String description, String instructor, List<Module> modules) {
        this.title = title;
        this.description = description;
        this.instructor = instructor;
        this.modules = modules;
    }

    // Getter and Setter for 'id'
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    // Getter and Setter for 'title'
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    // Getter and Setter for 'description'
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // Getter and Setter for 'instructor'
    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    // Getter and Setter for 'modules'
    public List<Module> getModules() {
        return modules;
    }

    public void setModules(List<Module> modules) {
        this.modules = modules;
    }
}