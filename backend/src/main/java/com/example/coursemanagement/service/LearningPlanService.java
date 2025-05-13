package com.example.coursemanagement.service;

import com.example.coursemanagement.model.LearningPlan;
import com.example.coursemanagement.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
//import java.util.Optional;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    public LearningPlan createLearningPlan(LearningPlan learningPlan) {
        if (learningPlan == null) {
            throw new IllegalArgumentException("LearningPlan cannot be null");
        }
        learningPlan.setCreatedAt(LocalDateTime.now());
        learningPlan.setUpdatedAt(LocalDateTime.now());
        return learningPlanRepository.save(learningPlan);
    }

    public List<LearningPlan> getLearningPlansByUserId(String userId) {
        return learningPlanRepository.findByUserId(userId);
    }

    public List<LearningPlan> getAllLearningPlans() {
        return learningPlanRepository.findAll();
    }

    public LearningPlan getLearningPlanById(String planId) {
        return learningPlanRepository.findById(planId).orElse(null);
    }

    public LearningPlan updateLearningPlan(String planId, LearningPlan updatedPlan) {
        LearningPlan existingPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Learning Plan not found with id: " + planId));

        existingPlan.setTitle(updatedPlan.getTitle());
        existingPlan.setDescription(updatedPlan.getDescription());
        existingPlan.setSelectedCourses(updatedPlan.getSelectedCourses());
        existingPlan.setTargetCompletionDate(updatedPlan.getTargetCompletionDate());
        existingPlan.setUpdatedAt(LocalDateTime.now());
        existingPlan.setProgressPercentage(updatedPlan.getProgressPercentage());

        return learningPlanRepository.save(existingPlan);
    }

    public void deleteLearningPlan(String planId) {
        LearningPlan plan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Learning Plan not found with id: " + planId));
        learningPlanRepository.delete(plan);
    }
}
