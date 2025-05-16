package com.example.coursemanagement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @SuppressWarnings("unchecked")
    public String generateLearningPlan(String goal) {
        RestTemplate restTemplate = new RestTemplate();

        // Set up headers
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openaiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create message body
        Map<String, Object> message = Map.of(
                "role", "user",
                "content", "Create a step-by-step learning plan for: " + goal
        );

        // Create request body
        Map<String, Object> request = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", List.of(message),
                "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_API_URL, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings({ "null" })
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> messageMap = (Map<String, Object>) choices.get(0).get("message");
                    return (String) messageMap.get("content");
                }
            }

            throw new RuntimeException("Invalid response from OpenAI API.");

        } catch (Exception e) {
            throw new RuntimeException("Error calling OpenAI API: " + e.getMessage(), e);
        }
    }
}
