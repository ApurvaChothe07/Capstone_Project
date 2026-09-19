package com.example.demo.service;

import com.example.demo.dto.InterviewFeedbackRequest;
import com.example.demo.entity.InterviewFeedback;
import com.example.demo.entity.InterviewSession;
import com.example.demo.repository.InterviewFeedbackRepository;
import com.example.demo.repository.InterviewSessionRepository;
import org.springframework.stereotype.Service;

@Service
public class InterviewFeedbackService {

    private final InterviewFeedbackRepository feedbackRepository;
    private final InterviewSessionRepository sessionRepository;

    public InterviewFeedbackService(
            InterviewFeedbackRepository feedbackRepository,
            InterviewSessionRepository sessionRepository) {

        this.feedbackRepository = feedbackRepository;
        this.sessionRepository = sessionRepository;
    }

    public InterviewFeedback saveFeedback(
            InterviewFeedbackRequest request) {

        InterviewSession session = sessionRepository
                .findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException(
                        "Interview session not found: "
                                + request.getSessionId()));

        InterviewFeedback feedback = new InterviewFeedback();

        feedback.setSession(session);

        feedback.setQ1(request.getQ1());
        feedback.setQ2(request.getQ2());
        feedback.setQ3(request.getQ3());
        feedback.setQ4(request.getQ4());
        feedback.setQ5(request.getQ5());
        feedback.setQ6(request.getQ6());
        feedback.setQ7(request.getQ7());
        feedback.setQ8(request.getQ8());
        feedback.setQ9(request.getQ9());
        feedback.setQ10(request.getQ10());

        return feedbackRepository.save(feedback);
    }
}