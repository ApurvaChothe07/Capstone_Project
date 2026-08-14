package com.example.demo.controller;

import com.example.demo.service.InterviewControlService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/interview")
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewControlController {

    private final InterviewControlService interviewControlService;

    public InterviewControlController(
            InterviewControlService interviewControlService) {

        this.interviewControlService = interviewControlService;
    }

    @PostMapping("/start")
    public String startRecording(
            @RequestParam Long candidateId,
            @RequestParam String question) {

        try {

            interviewControlService.startRecording(
                    candidateId,
                    question
            );

            return "Recording started successfully.";

        } catch (IOException e) {

            e.printStackTrace();

            return "Failed to start recording: " + e.getMessage();
        }
    }

    @PostMapping("/stop")
    public String stopRecording() {

        try {

            interviewControlService.stopRecording();

            return "Recording stopped successfully.";

        } catch (IOException e) {

            e.printStackTrace();

            return "Failed to stop recording: " + e.getMessage();
        }
    }
}