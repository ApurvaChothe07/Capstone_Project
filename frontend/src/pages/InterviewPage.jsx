import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import VideoPlayer from "../components/VideoPlayer";
import "./InterviewPage.css";

function InterviewPage() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionId, setSessionId] = useState(null);

    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const interimTranscriptRef = useRef("");

    const [listening, setListening] = useState(false);
    const listeningRef = useRef(false);

    const [isTalking, setIsTalking] = useState(false);
    const [hasSpoken, setHasSpoken] = useState(false);

    const [completed, setCompleted] = useState(false);

    const [countdown, setCountdown] = useState(20);

    const recognitionRef = useRef(null);

    const silenceTimer = useRef(null);
    const countdownTimer = useRef(null);
    const speakingTimer = useRef(null);

    const latestCallbacks = useRef({});

    latestCallbacks.current = {
        onResult: (event) => {
            setIsTalking(true);
            setHasSpoken(true);

            clearTimeout(speakingTimer.current);

            speakingTimer.current = setTimeout(() => {
                setIsTalking(false);
            }, 1500);

            let finalSegment = "";
            let interimSegment = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                if (event.results[i].isFinal) {
                    finalSegment +=
                        event.results[i][0].transcript + " ";
                } else {
                    interimSegment +=
                        event.results[i][0].transcript;
                }
            }

            if (finalSegment) {
                setTranscript((prev) => prev + finalSegment);
            }

            setInterimTranscript(interimSegment);
            interimTranscriptRef.current = interimSegment;

            resetSilenceTimer();
            startCountdown();
        },

        onEnd: () => {
            if (interimTranscriptRef.current) {
                setTranscript(
                    (prev) =>
                        prev +
                        interimTranscriptRef.current +
                        " "
                );

                setInterimTranscript("");
                interimTranscriptRef.current = "";
            }

            if (
                listeningRef.current &&
                recognitionRef.current
            ) {
                try {
                    recognitionRef.current.start();
                } catch (error) {
                    console.error(
                        "Failed to restart recognition:",
                        error
                    );
                }
            }
        },
    };

    // Initialize interview session and load questions
    useEffect(() => {
        const candidateData = localStorage.getItem("candidate");

        if (!candidateData) {
            console.error("Candidate information not found.");
            return;
        }

        const candidate = JSON.parse(candidateData);

        console.log("Candidate:", candidate);

        API.post("/sessions", {
            candidateId: candidate.id,
        })
            .then((sessionResponse) => {
                console.log(
                    "Interview session created:",
                    sessionResponse.data
                );

                setSessionId(sessionResponse.data.id);

                return API.get("/questions");
            })
            .then((questionResponse) => {
                console.log(
                    "Questions:",
                    questionResponse.data
                );

                setQuestions(questionResponse.data);
            })
            .catch((error) => {
                console.error(
                    "Failed to initialize interview:",
                    error
                );
            });
    }, []);

    // Interview completed screen
    if (completed) {
        return (
            <div className="completed-container">
                <h1>
                    <span className="text-gradient-green">
                        Interview Completed
                    </span>{" "}
                    ✅
                </h1>

                <p>
                    Thank you for attending the interview.
                </p>
            </div>
        );
    }

    // Loading screen
    if (questions.length === 0) {
        return (
            <div className="loading-container">
                <h2>Loading...</h2>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    // Reset silence timer
    const resetSilenceTimer = () => {
        clearTimeout(silenceTimer.current);

        silenceTimer.current = setTimeout(() => {
            nextQuestion();
        }, 20000);
    };

    // Start 20-second countdown
    const startCountdown = () => {
        clearInterval(countdownTimer.current);

        setCountdown(20);

        countdownTimer.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownTimer.current);
                    return 20;
                }

                return prev - 1;
            });
        }, 1000);
    };

    // Start speech recognition
    const startListening = () => {
        const SpeechRecognitionAPI =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            alert(
                "Speech Recognition is not supported."
            );
            return;
        }

        const recognition = new SpeechRecognitionAPI();

        recognition.continuous = true;
        recognition.interimResults = true;

        // Use browser language to better understand regional accents
        recognition.lang =
            navigator.language || "en-US";

        recognition.onresult = (event) =>
            latestCallbacks.current.onResult(event);

        recognition.onerror = (event) => {
            console.log(event.error);
        };

        recognition.onend = () =>
            latestCallbacks.current.onEnd();

        recognition.start();

        recognitionRef.current = recognition;

        setListening(true);
        listeningRef.current = true;

        resetSilenceTimer();
        startCountdown();
    };

    // Stop speech recognition
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
        }

        clearTimeout(silenceTimer.current);
        clearInterval(countdownTimer.current);

        setListening(false);
        listeningRef.current = false;
    };

    // Save answer and move to next question
    const nextQuestion = async () => {
        try {
            await API.post("/answers", {
                sessionId: sessionId,
                questionId: currentQuestion.id,
                answerText: (
                    transcript + interimTranscript
                ).trim(),
            });

            // Clear current answer
            setTranscript("");
            setInterimTranscript("");
            interimTranscriptRef.current = "";
            setHasSpoken(false);

            // Move to next question
            if (currentIndex < questions.length - 1) {
                setCurrentIndex((prev) => prev + 1);

                if (
                    listeningRef.current &&
                    recognitionRef.current
                ) {
                    recognitionRef.current.abort();
                }

                if (listeningRef.current) {
                    resetSilenceTimer();
                    startCountdown();
                }
            } else {
                // Last question completed
                stopListening();
                setCompleted(true);
            }
        } catch (error) {
            console.error(
                "Failed to save answer:",
                error
            );
        }
    };

    // Auto-start listening effect removed.
    // User must click "Start Speaking".

    return (
        <div className="interview-container">
            <div className="glass-panel">

                {/* Header */}
                <div className="header-section">
                    <h1 className="title">
                        <span className="sparkle">
                            ✦
                        </span>{" "}
                        AI Interview Simulator{" "}
                        <span className="sparkle">
                            ✦
                        </span>
                    </h1>

                    <p className="subtitle">
                        Practice. Speak. Succeed.
                    </p>
                </div>

                {/* Video */}
                <div className="video-section">
                    <div className="video-wrapper">
                        <VideoPlayer
                            videoName={
                                currentQuestion.videoName
                            }
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="question-section">
                    <div className="question-indicator-container">
                        <span className="dashed-line"></span>

                        <span className="question-counter">
                            QUESTION {currentIndex + 1} OF{" "}
                            {questions.length}
                        </span>

                        <span className="dashed-line"></span>
                    </div>

                    <h2 className="question-text">
                        <span className="quote-mark">
                            “
                        </span>

                        {currentQuestion.questionText}

                        <span className="quote-mark">
                            ”
                        </span>
                    </h2>

                    {/* Listening Status */}
                    <div
                        className="status-pill-container"
                        style={{
                            visibility:
                                !listening ||
                                isTalking ||
                                !hasSpoken
                                    ? "hidden"
                                    : "visible",
                        }}
                    >
                        <div className="status-pill">

                            <div className="listening-indicator">
                                <svg
                                    className="mic-icon-small"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>

                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>

                                    <line
                                        x1="12"
                                        y1="19"
                                        x2="12"
                                        y2="23"
                                    ></line>

                                    <line
                                        x1="8"
                                        y1="23"
                                        x2="16"
                                        y2="23"
                                    ></line>
                                </svg>

                                Listening...
                            </div>

                            <div className="divider"></div>

                            <div className="timer-indicator">
                                <svg
                                    className="timer-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                    ></circle>

                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>

                                <span className="time-text">
                                    00:
                                    {countdown
                                        .toString()
                                        .padStart(2, "0")}{" "}
                                    <span className="time-total">
                                        / 20:00
                                    </span>
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Bottom Panel */}
                <div className="bottom-panel">
                    <div className="controls-section">

                        {/* Start Speaking Button */}
                        {!listening &&
                            currentIndex === 0 && (
                                <button
                                    className="btn primary-btn"
                                    onClick={startListening}
                                >
                                    <svg
                                        className="btn-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>

                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>

                                        <line
                                            x1="12"
                                            y1="19"
                                            x2="12"
                                            y2="23"
                                        ></line>

                                        <line
                                            x1="8"
                                            y1="23"
                                            x2="16"
                                            y2="23"
                                        ></line>
                                    </svg>

                                    Start Speaking
                                </button>
                            )}

                        {/* Stop Speaking Button */}
                        {listening &&
                            currentIndex ===
                            questions.length - 1 && (
                                <button
                                    className="btn danger-btn"
                                    onClick={stopListening}
                                >
                                    <svg
                                        className="btn-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            x="3"
                                            y="3"
                                            width="18"
                                            height="18"
                                            rx="2"
                                            ry="2"
                                        ></rect>
                                    </svg>

                                    Stop Speaking
                                </button>
                            )}

                        {/* Next / Submit Button */}
                        <button
                            className="btn secondary-btn"
                            onClick={nextQuestion}
                        >
                            <svg
                                className="btn-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="13 17 18 12 13 7"></polyline>

                                <polyline points="6 17 11 12 6 7"></polyline>
                            </svg>

                            {currentIndex ===
                            questions.length - 1
                                ? "Submit"
                                : "Next Question"}
                        </button>
                    </div>

                    {/* Security Note */}
                    <div className="security-note">
                        <svg
                            className="shield-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>

                            <polyline points="9 12 11 14 15 10"></polyline>
                        </svg>

                        Your responses are securely
                        recorded and saved
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewPage;