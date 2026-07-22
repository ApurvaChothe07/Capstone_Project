package com.example.demo.service;

import com.example.demo.entity.InterviewQuestion;
import com.example.demo.repository.InterviewQuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InterviewQuestionService {

    private final InterviewQuestionRepository repository;

    public InterviewQuestionService(InterviewQuestionRepository repository) {
        this.repository = repository;
    }

    public List<InterviewQuestion> getAllQuestions() {
        return repository.findAll();
    }
}