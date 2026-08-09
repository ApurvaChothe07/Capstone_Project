package com.example.demo.controller;

import com.example.demo.dto.InterviewSessionRequest;
import com.example.demo.entity.InterviewSession;
import com.example.demo.service.InterviewSessionService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sessions")
@CrossOrigin("*")
public class InterviewSessionController {

    private final InterviewSessionService service;

    public InterviewSessionController(
            InterviewSessionService service) {
        this.service = service;
    }

    @PostMapping
    public InterviewSession createSession(
            @RequestBody InterviewSessionRequest request) {

        return service.createSession(request);
    }
}