package com.example.coursemanagement.controller;

import com.example.coursemanagement.model.LearningPlan;
import com.example.coursemanagement.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @PostMapping
    public ResponseEntity<LearningPlan> createLearningPlan(@Validated @RequestBody LearningPlan learningPlan) {
        LearningPlan created = learningPlanService.createLearningPlan(learningPlan);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<LearningPlan>> getLearningPlans(@PathVariable String userId) {
        List<LearningPlan> plans = learningPlanService.getLearningPlansByUserId(userId);
        return ResponseEntity.ok(plans);
    }

    @PutMapping("/{planId}")
    public ResponseEntity<LearningPlan> updateLearningPlan(@PathVariable String planId, @Validated @RequestBody LearningPlan learningPlan) {
        LearningPlan updated = learningPlanService.updateLearningPlan(planId, learningPlan);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deleteLearningPlan(@PathVariable String planId) {
        learningPlanService.deleteLearningPlan(planId);
        return ResponseEntity.noContent().build();
    }
}
