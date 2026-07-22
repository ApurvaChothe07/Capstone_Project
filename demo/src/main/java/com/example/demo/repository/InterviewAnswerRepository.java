package com.example.demo.repository;

import com.example.demo.entity.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewAnswerRepository
        extends JpaRepository<InterviewAnswer, Long> {
}