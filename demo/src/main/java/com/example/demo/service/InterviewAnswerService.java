package com.example.demo.service;

import com.example.demo.dto.InterviewAnswerRequest;
import com.example.demo.entity.InterviewAnswer;
import com.example.demo.entity.InterviewQuestion;
import com.example.demo.entity.InterviewSession;
import com.example.demo.repository.InterviewAnswerRepository;
import com.example.demo.repository.InterviewQuestionRepository;
import com.example.demo.repository.InterviewSessionRepository;
import org.springframework.stereotype.Service;

@Service
public class InterviewAnswerService {

    private final InterviewAnswerRepository answerRepository;
    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;

    public InterviewAnswerService(
            InterviewAnswerRepository answerRepository,
            InterviewSessionRepository sessionRepository,
            InterviewQuestionRepository questionRepository) {

        this.answerRepository = answerRepository;
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
    }

    public InterviewAnswer saveAnswer(InterviewAnswerRequest request) {

        InterviewSession session = sessionRepository
                .findById(request.getSessionId())
                .orElseThrow(() ->
                        new RuntimeException("Interview session not found"));

        InterviewQuestion question = questionRepository
                .findById(request.getQuestionId())
                .orElseThrow(() ->
                        new RuntimeException("Interview question not found"));

        InterviewAnswer answer = new InterviewAnswer();

        answer.setSession(session);
        answer.setQuestion(question);
        answer.setAnswerText(request.getAnswerText());

        return answerRepository.save(answer);
    }
}