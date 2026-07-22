package com.example.demo.service;

import com.example.demo.entity.InterviewAnswer;
import com.example.demo.repository.InterviewAnswerRepository;
import org.springframework.stereotype.Service;

@Service
public class InterviewAnswerService {

    private final InterviewAnswerRepository repository;

    public InterviewAnswerService(
            InterviewAnswerRepository repository) {
        this.repository = repository;
    }

    public InterviewAnswer saveAnswer(
            InterviewAnswer answer) {

        return repository.save(answer);
    }
}