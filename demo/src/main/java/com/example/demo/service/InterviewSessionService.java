package com.example.demo.service;

import com.example.demo.dto.InterviewSessionRequest;
import com.example.demo.entity.Candidate;
import com.example.demo.entity.InterviewSession;
import com.example.demo.repository.CandidateRepository;
import com.example.demo.repository.InterviewSessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class InterviewSessionService {

    private final InterviewSessionRepository sessionRepository;
    private final CandidateRepository candidateRepository;

    public InterviewSessionService(
            InterviewSessionRepository sessionRepository,
            CandidateRepository candidateRepository) {

        this.sessionRepository = sessionRepository;
        this.candidateRepository = candidateRepository;
    }

    public InterviewSession createSession(
            InterviewSessionRequest request) {

        Candidate candidate = candidateRepository
                .findById(request.getCandidateId())
                .orElseThrow(() ->
                        new RuntimeException("Candidate not found"));

        InterviewSession session = new InterviewSession();

        session.setCandidate(candidate);
        session.setStartTime(LocalDateTime.now());

        return sessionRepository.save(session);
    }
}