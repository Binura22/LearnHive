package com.example.coursemanagement.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "learning_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlan {

    @Id
    private String id;

    private String userId;
    private String title;
    private String description;
    private List<CourseSelection> selectedCourses;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime targetCompletionDate;

    private double progressPercentage;
    
}
