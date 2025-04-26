package com.example.coursemanagement.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseSelection {
    private String courseId;
    private List<String> selectedModuleIds;

}
