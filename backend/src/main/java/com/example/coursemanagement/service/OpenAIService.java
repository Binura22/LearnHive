package com.example.coursemanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.coursemanagement.model.Course;
import com.example.coursemanagement.repository.CourseRepository;

import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    @Autowired
    private CourseRepository courseRepository;

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @SuppressWarnings("unchecked")
    public String generateLearningPlan(String goal) {
        RestTemplate restTemplate = new RestTemplate();

        List<String> availableTitles = courseRepository.findAll()
                .stream()
                .map(Course::getTitle)
                .toList();

        String availableTitlesStr = String.join(", ", availableTitles);

        System.out.println("Available titles" + availableTitles);

        String today = java.time.LocalDate.now().toString();

        String userMessage = String.format(
                """
                        You are an educational planning assistant.

                        Today's date is %s.

                        Based on the goal: "%s", generate a structured learning plan.

                        Only use course titles from this list: [%s].

                       ⚠️ Important:
                        - Only include courses that are highly relevant to the goal.
                        - Do NOT include unrelated or general-purpose courses just to fill space.
                        - It's okay to include 1 to 3 course titles, but they must be directly applicable to the goal.
                        - If none match, return an empty courseTitles array.

                        Respond **strictly** in valid JSON format with the following fields:
                        - title: A short title for the learning plan.
                        - description: A brief summary of the plan.
                        - targetCompletionDate: A future date in YYYY-MM-DD format (must be after today).
                        - courseTitles: An array of 0 to 3 course titles from the provided list, only if truly relevant.

                        Do not include any text outside the JSON.
                        """,
                today, goal, availableTitlesStr);

        // Set up headers
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openaiApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create message body
        Map<String, Object> message = Map.of(
                "role", "user",
                "content", userMessage);

        // Create request body
        Map<String, Object> request = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", List.of(message),
                "temperature", 0.7);

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
