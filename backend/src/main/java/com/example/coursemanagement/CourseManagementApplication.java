package com.example.coursemanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.example.coursemanagement.repository")
public class CourseManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(CourseManagementApplication.class, args);
    }
}