package com.example.coursemanagement.model;

import org.springframework.data.annotation.Id;

public class Module {

    @Id
    private String id;
    private String courseId; // Link to the parent course
    private String title;
    private String description;
    private String videoLink;
    private String pdfLink;

    // Constructors, Getters, and Setters
    public Module() {}

    public Module(String courseId, String title, String description, String videoLink, String pdfLink) {
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.videoLink = videoLink;
        this.pdfLink = pdfLink;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
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

    public String getVideoLink() {
        return videoLink;
    }

    public void setVideoLink(String videoLink) {
        this.videoLink = videoLink;
    }

    public String getPdfLink() {
        return pdfLink;
    }

    public void setPdfLink(String pdfLink) {
        this.pdfLink = pdfLink;
    }
}