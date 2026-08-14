package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class InterviewControlService {

    private static final String PYTHON = "python";

    private static final String START_SCRIPT = "../python/start_recording.py";
    private static final String STOP_SCRIPT = "../python/stop_recording.py";

    private static final String EYETRACK_EXE =
            "../enhanced-tobii-eyetracker-main/bin/eyeTrack.exe";

    private Process eyeTrackProcess;

    public void startRecording(Long candidateId, String question) throws IOException {

        // Start eyeTrack.exe only if it is not already running
        if (eyeTrackProcess == null || !eyeTrackProcess.isAlive()) {

            ProcessBuilder eyeTrackBuilder =
                    new ProcessBuilder(EYETRACK_EXE);

            eyeTrackBuilder.directory(
                    new java.io.File(
                            "../enhanced-tobii-eyetracker-main/bin"
                    )
            );

            eyeTrackBuilder.inheritIO();

            eyeTrackProcess = eyeTrackBuilder.start();

            System.out.println("eyeTrack.exe started successfully.");

            // Give eyeTrack.exe time to initialize
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        // Send start command to Tobii
        ProcessBuilder pythonStart = new ProcessBuilder(
                PYTHON,
                START_SCRIPT,
                String.valueOf(candidateId),
                question
        );

        pythonStart.inheritIO();
        pythonStart.start();

        System.out.println(
                "Tobii recording started for candidate "
                        + candidateId
                        + ", question "
                        + question
        );
    }

    public void stopRecording() throws IOException {

        // Send stop command
        ProcessBuilder pythonStop = new ProcessBuilder(
                PYTHON,
                STOP_SCRIPT
        );

        pythonStop.inheritIO();
        pythonStop.start();

        System.out.println("Python stop command sent.");

        // Allow C++ program time to save the data
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("Tobii recording stopped.");
    }

    public void shutdownEyeTracker() {

        if (eyeTrackProcess != null && eyeTrackProcess.isAlive()) {

            eyeTrackProcess.destroy();

            System.out.println("eyeTrack.exe stopped.");

        }

        eyeTrackProcess = null;
    }
}