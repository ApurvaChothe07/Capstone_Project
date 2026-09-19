package com.example.demo.repository;

import com.example.demo.entity.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewFeedbackRepository
        extends JpaRepository<InterviewFeedback, Long> {
}
