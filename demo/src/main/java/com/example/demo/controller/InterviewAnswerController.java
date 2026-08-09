package com.example.demo.controller;

import com.example.demo.dto.InterviewAnswerRequest;
import com.example.demo.entity.InterviewAnswer;
import com.example.demo.service.InterviewAnswerService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/answers")
@CrossOrigin("*")
public class InterviewAnswerController {

    private final InterviewAnswerService service;

    public InterviewAnswerController(
            InterviewAnswerService service) {
        this.service = service;
    }

    @PostMapping
    public InterviewAnswer saveAnswer(
            @RequestBody InterviewAnswerRequest request) {

        return service.saveAnswer(request);
    }
}