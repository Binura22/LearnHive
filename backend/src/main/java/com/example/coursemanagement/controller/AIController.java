package com.example.coursemanagement.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.coursemanagement.service.OpenAIService;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private OpenAIService openAiService;

    @PostMapping("/generate-plan")
    public ResponseEntity<?> generatePlan(@RequestBody Map<String, String> body) {
        String goal = body.get("goal");

        if (goal == null || goal.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Goal is required."));
        }

        String plan = openAiService.generateLearningPlan(goal);
        return ResponseEntity.ok(Map.of("plan", plan));
    }
}

