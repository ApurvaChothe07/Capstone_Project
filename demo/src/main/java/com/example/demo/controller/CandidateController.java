package com.example.demo.controller;

import jakarta.validation.Valid;
import com.example.demo.entity.Candidate;
import com.example.demo.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/candidates")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @PostMapping
    public Candidate registerCandidate(@Valid @RequestBody Candidate candidate) {
        return candidateService.registerCandidate(candidate);
    }

}
