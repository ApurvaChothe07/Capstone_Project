package com.example.demo.controller;

import com.example.demo.dto.InterviewFeedbackRequest;
import com.example.demo.entity.InterviewFeedback;
import com.example.demo.service.InterviewFeedbackService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feedback")
@CrossOrigin("*")
public class InterviewFeedbackController {

    private final InterviewFeedbackService service;

    public InterviewFeedbackController(
            InterviewFeedbackService service) {

        this.service = service;
    }

    @PostMapping
    public InterviewFeedback saveFeedback(
            @RequestBody InterviewFeedbackRequest request) {

        return service.saveFeedback(request);
    }
}