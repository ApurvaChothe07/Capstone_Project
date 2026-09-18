import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import VideoPlayer from "../components/VideoPlayer";
import "./InterviewPage.css";

function InterviewPage() {
    // ==============================
    // Question / Interview State
    // ==============================

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionId, setSessionId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [completed, setCompleted] = useState(false);

    // ==============================
    // Speech Recognition State
    // ==============================

    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");

    const [listening, setListening] = useState(false);
    const [isTalking, setIsTalking] = useState(false);
    const [hasSpoken, setHasSpoken] = useState(false);

    // ==============================
    // Timer
    // ==============================

    const [countdown, setCountdown] = useState(20);

    // ==============================
    // Video Replay
    // ==============================

    const [videoReplayKey, setVideoReplayKey] = useState(0);

    // ==============================
    // Refs
    // ==============================

    const recognitionRef = useRef(null);

    const silenceTimerRef = useRef(null);
    const countdownTimerRef = useRef(null);
    const speakingTimerRef = useRef(null);

    const interimTranscriptRef = useRef("");
    const listeningRef = useRef(false);

    const questionsRef = useRef([]);
    const currentIndexRef = useRef(0);
    const sessionIdRef = useRef(null);

    const transcriptRef = useRef("");
    const nextQuestionRef = useRef(null);

    // Prevent duplicate answer submissions
    const processingNextRef = useRef(false);

    // ==============================
    // Keep refs synchronized
    // ==============================

    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);

    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    // ============================================================
    // Clear all timers
    // ============================================================

    const clearAllTimers = () => {
        clearTimeout(silenceTimerRef.current);
        clearInterval(countdownTimerRef.current);
        clearTimeout(speakingTimerRef.current);

        silenceTimerRef.current = null;
        countdownTimerRef.current = null;
        speakingTimerRef.current = null;
    };

    // ============================================================
    // Start / Reset 20 second silence timer
    // ============================================================

    const resetSilenceTimer = () => {
        clearTimeout(silenceTimerRef.current);

        setCountdown(20);

        silenceTimerRef.current = setTimeout(() => {
            console.log(
                "20 seconds of silence detected."
            );

            if (nextQuestionRef.current) {
                nextQuestionRef.current();
            }
        }, 20000);
    };

    // ============================================================
    // Start countdown
    // ============================================================

    const startCountdown = () => {
        clearInterval(countdownTimerRef.current);

        setCountdown(20);

        countdownTimerRef.current = setInterval(() => {
            setCountdown((previous) => {
                if (previous <= 1) {
                    clearInterval(
                        countdownTimerRef.current
                    );

                    return 20;
                }

                return previous - 1;
            });
        }, 1000);
    };

    // ============================================================
    // Stop speech recognition
    // ============================================================

    const stopRecognitionOnly = () => {
        listeningRef.current = false;
        setListening(false);

        if (recognitionRef.current) {
            recognitionRef.current.onend = null;

            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.log(
                    "Recognition already stopped."
                );
            }

            recognitionRef.current = null;
        }

        clearAllTimers();
    };

    // ============================================================
    // Start speech recognition
    // ============================================================

    const startListening = () => {
        const SpeechRecognitionAPI =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            alert(
                "Speech Recognition is not supported in this browser. Please use Google Chrome."
            );

            return;
        }

        // Prevent multiple recognition instances
        if (listeningRef.current) {
            return;
        }

        const recognition =
            new SpeechRecognitionAPI();

        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.lang =
            navigator.language || "en-US";

        // ==============================
        // Speech Result
        // ==============================

        recognition.onresult = (event) => {
            setIsTalking(true);
            setHasSpoken(true);

            clearTimeout(
                speakingTimerRef.current
            );

            speakingTimerRef.current =
                setTimeout(() => {
                    setIsTalking(false);
                }, 1500);

            let finalSegment = "";
            let interimSegment = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                const result =
                    event.results[i];

                const text =
                    result[0].transcript;

                if (result.isFinal) {
                    finalSegment += text + " ";
                } else {
                    interimSegment += text;
                }
            }

            if (finalSegment) {
                setTranscript((previous) => {
                    const updated =
                        previous +
                        finalSegment;

                    transcriptRef.current =
                        updated;

                    return updated;
                });
            }

            setInterimTranscript(
                interimSegment
            );

            interimTranscriptRef.current =
                interimSegment;

            // Candidate spoke, therefore
            // reset the 20-second silence timer
            resetSilenceTimer();
            startCountdown();
        };

        // ==============================
        // Speech Error
        // ==============================

        recognition.onerror = (event) => {
            console.error(
                "Speech recognition error:",
                event.error
            );

            // Some errors should not completely
            // destroy the interview.
            if (
                event.error ===
                "not-allowed" ||
                event.error ===
                "service-not-allowed"
            ) {
                listeningRef.current =
                    false;

                setListening(false);

                clearAllTimers();

                alert(
                    "Microphone permission is required for speech recognition."
                );
            }
        };

        // ==============================
        // Recognition End
        // ==============================

        recognition.onend = () => {
            // Save any remaining interim text
            if (interimTranscriptRef.current) {
                setTranscript((previous) => {
                    const updated =
                        previous +
                        interimTranscriptRef.current +
                        " ";

                    transcriptRef.current =
                        updated;

                    return updated;
                });

                setInterimTranscript("");

                interimTranscriptRef.current =
                    "";
            }

            // Automatically restart if the
            // interview is still listening
            if (
                listeningRef.current &&
                recognitionRef.current ===
                recognition
            ) {
                try {
                    recognition.start();
                } catch (error) {
                    console.log(
                        "Recognition restart skipped."
                    );
                }
            }
        };

        try {
            recognition.start();

            recognitionRef.current =
                recognition;

            listeningRef.current = true;

            setListening(true);

            resetSilenceTimer();
            startCountdown();

            console.log(
                "Speech recognition started."
            );
        } catch (error) {
            console.error(
                "Failed to start speech recognition:",
                error
            );
        }
    };

    // ============================================================
    // Stop speaking
    // ============================================================

    const stopListening = () => {
        console.log(
            "Speech recognition stopped."
        );

        stopRecognitionOnly();

        setIsTalking(false);
    };

    // ============================================================
    // Initialize interview
    // ============================================================

    useEffect(() => {
        const initializeInterview =
            async () => {
                try {
                    setLoading(true);
                    setErrorMessage("");

                    // ------------------------------
                    // Get candidate
                    // ------------------------------

                    const candidateData =
                        localStorage.getItem(
                            "candidate"
                        );

                    console.log(
                        "Candidate data:",
                        candidateData
                    );

                    if (!candidateData) {
                        throw new Error(
                            "Candidate information was not found. Please complete registration first."
                        );
                    }

                    let candidate;

                    try {
                        candidate =
                            JSON.parse(
                                candidateData
                            );
                    } catch (error) {
                        throw new Error(
                            "Candidate information is invalid. Please register again."
                        );
                    }

                    console.log(
                        "Parsed candidate:",
                        candidate
                    );

                    if (
                        !candidate ||
                        !candidate.id
                    ) {
                        throw new Error(
                            "Candidate ID was not found. Please complete registration again."
                        );
                    }

                    // ------------------------------
                    // Create session
                    // ------------------------------

                    console.log(
                        "Creating interview session..."
                    );

                    const sessionResponse =
                        await API.post(
                            "/sessions",
                            {
                                candidateId:
                                candidate.id,
                            }
                        );

                    console.log(
                        "Interview session created:",
                        sessionResponse.data
                    );

                    const newSessionId =
                        sessionResponse.data.id;

                    if (!newSessionId) {
                        throw new Error(
                            "Interview session ID was not returned by the server."
                        );
                    }

                    setSessionId(
                        newSessionId
                    );

                    sessionIdRef.current =
                        newSessionId;

                    // ------------------------------
                    // Load questions
                    // ------------------------------

                    console.log(
                        "Loading interview questions..."
                    );

                    const questionResponse =
                        await API.get(
                            "/questions"
                        );

                    console.log(
                        "Questions received:",
                        questionResponse.data
                    );

                    if (
                        !Array.isArray(
                            questionResponse.data
                        )
                    ) {
                        throw new Error(
                            "Invalid question data received from the server."
                        );
                    }

                    if (
                        questionResponse.data
                            .length === 0
                    ) {
                        throw new Error(
                            "No interview questions were found in the database."
                        );
                    }

                    // Sort by ID so the sequence
                    // is always correct
                    const sortedQuestions =
                        [
                            ...questionResponse.data,
                        ].sort(
                            (a, b) =>
                                a.id - b.id
                        );

                    console.log(
                        "Sorted questions:",
                        sortedQuestions
                    );

                    setQuestions(
                        sortedQuestions
                    );

                    questionsRef.current =
                        sortedQuestions;

                    setCurrentIndex(0);

                    currentIndexRef.current =
                        0;

                    setLoading(false);
                } catch (error) {
                    console.error(
                        "Failed to initialize interview:",
                        error
                    );

                    let message =
                        "Failed to load the interview.";

                    if (
                        error.response
                            ?.data
                    ) {
                        console.error(
                            "Backend response:",
                            error.response.data
                        );
                    }

                    if (error.message) {
                        message =
                            error.message;
                    }

                    setErrorMessage(
                        message
                    );

                    setLoading(false);
                }
            };

        initializeInterview();

        return () => {
            stopRecognitionOnly();
        };
    }, []);

    // ============================================================
    // Replay video
    // ============================================================

    const replayVideo = () => {
        setVideoReplayKey(
            (previous) =>
                previous + 1
        );
    };

    // ============================================================
    // Move to next question / Submit
    // ============================================================

    const nextQuestion = async () => {
        // Prevent double-click / duplicate submission
        if (processingNextRef.current) {
            return;
        }

        processingNextRef.current = true;

        try {
            const currentQuestions =
                questionsRef.current;

            const currentQuestionIndex =
                currentIndexRef.current;

            const currentSessionId =
                sessionIdRef.current;

            if (!currentSessionId) {
                throw new Error(
                    "Session ID is not available."
                );
            }

            if (
                currentQuestions.length ===
                0
            ) {
                throw new Error(
                    "Questions are not available."
                );
            }

            const currentQuestion =
                currentQuestions[
                    currentQuestionIndex
                    ];

            if (!currentQuestion) {
                throw new Error(
                    "Current question was not found."
                );
            }

            // --------------------------------
            // Stop timer while saving answer
            // --------------------------------

            clearAllTimers();

            // --------------------------------
            // Get final answer
            // --------------------------------

            let finalAnswer =
                transcriptRef.current;

            if (
                interimTranscriptRef.current
            ) {
                finalAnswer +=
                    " " +
                    interimTranscriptRef.current;
            }

            finalAnswer =
                finalAnswer.trim();

            console.log(
                "Saving answer:",
                {
                    sessionId:
                    currentSessionId,
                    questionId:
                    currentQuestion.id,
                    answerText:
                    finalAnswer,
                }
            );

            // --------------------------------
            // Save answer
            // --------------------------------

            await API.post(
                "/answers",
                {
                    sessionId:
                    currentSessionId,
                    questionId:
                    currentQuestion.id,
                    answerText:
                    finalAnswer,
                }
            );

            console.log(
                "Answer saved successfully."
            );

            // --------------------------------
            // Clear answer
            // --------------------------------

            setTranscript("");
            transcriptRef.current = "";

            setInterimTranscript("");

            interimTranscriptRef.current =
                "";

            setHasSpoken(false);
            setIsTalking(false);

            // --------------------------------
            // Is this the last question?
            // --------------------------------

            if (
                currentQuestionIndex >=
                currentQuestions.length - 1
            ) {
                console.log(
                    "All questions completed."
                );

                stopRecognitionOnly();

                setCompleted(true);

                return;
            }

            // --------------------------------
            // Move to next question
            // --------------------------------

            const nextIndex =
                currentQuestionIndex + 1;

            setCurrentIndex(
                nextIndex
            );

            currentIndexRef.current =
                nextIndex;

            // Reset video
            setVideoReplayKey(0);

            console.log(
                `Moving to question ${
                    nextIndex + 1
                }`
            );

            // --------------------------------
            // Continue listening automatically
            // --------------------------------

            const wasListening =
                listeningRef.current;

            stopRecognitionOnly();

            // Give React time to render
            // the next question
            if (wasListening) {
                setTimeout(() => {
                    startListening();
                }, 300);
            }
        } catch (error) {
            console.error(
                "Failed to save answer or move to next question:",
                error
            );

            if (
                error.response
                    ?.data
            ) {
                console.error(
                    "Backend response:",
                    error.response.data
                );
            }

            alert(
                "Could not save your answer. Please try again."
            );
        } finally {
            processingNextRef.current =
                false;
        }
    };

    // Keep the latest nextQuestion function
    // available to the silence timer.
    useEffect(() => {
        nextQuestionRef.current =
            nextQuestion;
    });

    // ============================================================
    // Cleanup
    // ============================================================

    useEffect(() => {
        return () => {
            clearAllTimers();

            listeningRef.current =
                false;

            if (recognitionRef.current) {
                recognitionRef.current.onend =
                    null;

                try {
                    recognitionRef.current.stop();
                } catch (error) {
                    console.log(
                        "Recognition cleanup completed."
                    );
                }

                recognitionRef.current =
                    null;
            }
        };
    }, []);

    // ============================================================
    // Loading Screen
    // ============================================================

    if (loading) {
        return (
            <div className="loading-container">
                <h2>
                    Loading Interview...
                </h2>

                <p>
                    Preparing your questions
                    and interview session.
                </p>
            </div>
        );
    }

    // ============================================================
    // Error Screen
    // ============================================================

    if (errorMessage) {
        return (
            <div className="loading-container">
                <h2>
                    Unable to Start Interview
                </h2>

                <p>
                    {errorMessage}
                </p>

                <button
                    className="btn primary-btn"
                    onClick={() =>
                        window.location.reload()
                    }
                >
                    Retry
                </button>
            </div>
        );
    }

    // ============================================================
    // Completed Screen
    // ============================================================

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
                    Thank you for attending
                    the interview.
                </p>

                <p>
                    Your responses have been
                    securely recorded.
                </p>
            </div>
        );
    }

    // ============================================================
    // Safety check
    // ============================================================

    if (
        questions.length === 0
    ) {
        return (
            <div className="loading-container">
                <h2>
                    No Questions Found
                </h2>

                <p>
                    Please check the interview
                    question database.
                </p>
            </div>
        );
    }

    // ============================================================
    // Current Question
    // ============================================================

    const currentQuestion =
        questions[currentIndex];

    const isLastQuestion =
        currentIndex ===
        questions.length - 1;

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="interview-container">
            <div className="glass-panel">

                {/* ================= HEADER ================= */}

                <div className="header-section">
                    <h1 className="title">
                        <span className="sparkle">
                            ✦
                        </span>{" "}
                        AI Interview
                        Simulator{" "}
                        <span className="sparkle">
                            ✦
                        </span>
                    </h1>

                    <p className="subtitle">
                        Practice. Speak.
                        Succeed.
                    </p>
                </div>

                {/* ================= VIDEO ================= */}

                <div className="video-section">
                    <div className="video-wrapper">

                        <VideoPlayer
                            key={`${currentQuestion.videoName}-${videoReplayKey}`}
                            videoName={
                                currentQuestion.videoName
                            }
                        />

                        <button
                            type="button"
                            className="replay-btn"
                            onClick={
                                replayVideo
                            }
                            title="Replay Video"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="1 4 1 10 7 10" />

                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ================= QUESTION ================= */}

                <div className="question-section">

                    <div className="question-indicator-container">

                        <span className="dashed-line"></span>

                        <span className="question-counter">
                            QUESTION{" "}
                            {currentIndex + 1}{" "}
                            OF{" "}
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

                    {/* ================= LISTENING STATUS ================= */}

                    <div
                        className="status-pill-container"
                        style={{
                            visibility:
                                listening
                                    ? "visible"
                                    : "hidden",
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
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />

                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />

                                    <line
                                        x1="12"
                                        y1="19"
                                        x2="12"
                                        y2="23"
                                    />

                                    <line
                                        x1="8"
                                        y1="23"
                                        x2="16"
                                        y2="23"
                                    />
                                </svg>

                                {isTalking
                                    ? "Speaking..."
                                    : "Listening..."}

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
                                    />

                                    <polyline points="12 6 12 12 16 14" />
                                </svg>

                                <span className="time-text">
                                    00:
                                    {countdown
                                        .toString()
                                        .padStart(
                                            2,
                                            "0"
                                        )}

                                    <span className="time-total">
                                        {" "}
                                        / 20:00
                                    </span>
                                </span>

                            </div>

                        </div>
                    </div>
                </div>

                {/* ================= CONTROLS ================= */}

                <div className="bottom-panel">

                    <div className="controls-section">

                        {/* Start Speaking */}

                        {!listening && (
                            <button
                                type="button"
                                className="btn primary-btn"
                                onClick={
                                    startListening
                                }
                                style={{
                                    display:
                                        "flex",
                                    visibility:
                                        "visible",
                                    opacity: 1,
                                }}
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
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />

                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />

                                    <line
                                        x1="12"
                                        y1="19"
                                        x2="12"
                                        y2="23"
                                    />

                                    <line
                                        x1="8"
                                        y1="23"
                                        x2="16"
                                        y2="23"
                                    />
                                </svg>

                                Start Speaking
                            </button>
                        )}

                        {/* Stop Speaking */}

                        {listening && (
                            <button
                                type="button"
                                className="btn danger-btn"
                                onClick={
                                    stopListening
                                }
                                style={{
                                    display:
                                        "flex",
                                    visibility:
                                        "visible",
                                    opacity: 1,
                                }}
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
                                    />
                                </svg>

                                Stop Speaking
                            </button>
                        )}

                        {/* Next / Submit */}

                        <button
                            type="button"
                            className="btn secondary-btn"
                            onClick={
                                nextQuestion
                            }
                            disabled={
                                processingNextRef.current
                            }
                            style={{
                                display:
                                    "flex",
                                visibility:
                                    "visible",
                                opacity: 1,
                                cursor:
                                    "pointer",
                            }}
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
                                <polyline points="13 17 18 12 13 7" />

                                <polyline points="6 17 11 12 6 7" />
                            </svg>

                            {isLastQuestion
                                ? "Submit"
                                : "Next Question"}
                        </button>

                    </div>

                    {/* ================= SECURITY NOTE ================= */}

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
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />

                            <polyline points="9 12 11 14 15 10" />
                        </svg>

                        Your responses are
                        securely recorded
                        and saved

                    </div>

                </div>
            </div>
        </div>
    );
}

export default InterviewPage;