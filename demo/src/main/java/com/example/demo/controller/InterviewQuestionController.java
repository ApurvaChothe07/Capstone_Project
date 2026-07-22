package com.example.demo.controller;

import com.example.demo.entity.InterviewQuestion;
import com.example.demo.service.InterviewQuestionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
@CrossOrigin("*")
public class InterviewQuestionController {

    private final InterviewQuestionService service;

    public InterviewQuestionController(InterviewQuestionService service) {
        this.service = service;
    }

    @GetMapping
    public List<InterviewQuestion> getAllQuestions() {
        return service.getAllQuestions();
    }
}