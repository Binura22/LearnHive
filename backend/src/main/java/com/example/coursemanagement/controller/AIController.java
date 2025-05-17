package com.example.coursemanagement.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.coursemanagement.service.OpenAIService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private OpenAIService openAiService;

    @PostMapping("/generate-plan")
    public ResponseEntity<?> generatePlan(@RequestBody Map<String, String> body) {
        String goal = body.get("goal");
        String jsonPlan = openAiService.generateLearningPlan(goal);

        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> structuredPlan = mapper.readValue(jsonPlan, new TypeReference<>() {
            });
            return ResponseEntity.ok(structuredPlan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Invalid AI response format.");
        }
    }

}
