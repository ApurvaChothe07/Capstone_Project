import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./InterviewPage.css";

function InterviewPage() {
    const navigate = useNavigate();

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
    const videoRef = useRef(null);

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
            }, 1500); // Hide timer for 1.5s after they stop speaking

            let finalSegment = "";
            let interimSegment = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalSegment += event.results[i][0].transcript + " ";
                } else {
                    interimSegment += event.results[i][0].transcript;
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
                setTranscript((prev) => prev + interimTranscriptRef.current + " ");
                setInterimTranscript("");
                interimTranscriptRef.current = "";
            }

            if (listeningRef.current && recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (error) {
                    console.error("Failed to restart recognition", error);
                }
            }
        }
    };

    useEffect(() => {

        const staticQuestions = [
            { id: 1, questionText: "Please introduce yourself and tell us briefly about your educational background, technical interests, and career goals." },
            { id: 2, questionText: "What is the difference between an ArrayList and a LinkedList in Java, and when would you use each?" },
            { id: 3, questionText: "Tell us about a technical project you have worked on. What was your role, and what challenges did you face?" },
            { id: 4, questionText: "Suppose your application suddenly starts returning a 500 Internal Server Error. How would you investigate and resolve the problem?" },
            { id: 5, questionText: "Suppose you are working on a team and another team member strongly disagrees with your technical approach. How would you handle the situation?" },
            { id: 6, questionText: "Tell us about a technical problem you faced in one of your projects and explain how you solved it." },
            { id: 7, questionText: "If you are asked a technical question that you don't know the answer to, what would you do?" },
            { id: 8, questionText: "Why do you think you would be a good fit for a software development role?" }
        ];
        setQuestions(staticQuestions);

        const candidateStr = localStorage.getItem("candidate");
        if (candidateStr) {
            try {
                const candidate = JSON.parse(candidateStr);
                if (candidate && candidate.id) {
                    API.post("/sessions", { candidateId: candidate.id })
                        .then((res) => {
                            setSessionId(res.data.id);
                        })
                        .catch((err) => {
                            console.error("Failed to create session:", err);
                        });
                }
            } catch (e) {
                console.error("Error parsing candidate from localStorage:", e);
            }
        } else {
            console.warn("No candidate data found in localStorage. Cannot create interview session.");
        }

    }, []);
    if (completed) {

        return (

            <div className="completed-container">

                <h1>
                    <span className="text-gradient-green">Interview Completed</span> ✅
                </h1>

                <p>
                    Thank you for attending the interview.
                </p>

                <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
                    <button 
                        className="btn primary-btn" 
                        onClick={() => navigate("/feedback")}
                    >
                        Give Feedback
                    </button>
                </div>

            </div>

        );

    }

    if (questions.length === 0) {

        return (
            <div className="loading-container">
                <h2>Loading...</h2>
            </div>
        );

    }

    const currentQuestion = questions[currentIndex];
    const resetSilenceTimer = () => {

        clearTimeout(silenceTimer.current);

        silenceTimer.current = setTimeout(() => {

            nextQuestion();

        }, 20000);

    };

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

    const startListening = () => {

        const SpeechRecognitionAPI =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {

            alert("Speech Recognition is not supported.");

            return;

        }

        const recognition = new SpeechRecognitionAPI();

        recognition.continuous = true;

        recognition.interimResults = true;

        // Use the user's browser language to better understand regional accents
        recognition.lang = navigator.language || "en-US";

        recognition.onresult = (event) => latestCallbacks.current.onResult(event);

        recognition.onerror = (event) => {

            console.log(event.error);

        };

        recognition.onend = () => latestCallbacks.current.onEnd();

        recognition.start();

        recognitionRef.current = recognition;

        setListening(true);
        listeningRef.current = true;

        resetSilenceTimer();

        startCountdown();

    };

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

    const replayVideo = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    };

    const nextQuestion = async () => {

        try {
            await API.post("/answers", {
                sessionId: sessionId,
                questionId: currentQuestion.id,
                answerText: (transcript + interimTranscript).trim()
            });
        } catch (error) {
            console.error("Failed to submit answer:", error);
        }

        setTranscript("");
        setInterimTranscript("");
        interimTranscriptRef.current = "";
        setHasSpoken(false);



        if (currentIndex < questions.length - 1) {

            setCurrentIndex((prev) => prev + 1);

            if (listeningRef.current && recognitionRef.current) {
                recognitionRef.current.abort();
            }

            if (listeningRef.current) {
                resetSilenceTimer();
                startCountdown();
            }

        } else {

            stopListening();

            setCompleted(true);

        }

    };

    // Auto-start listening effect removed to require "Start Speaking" click
    return (
        <div className="interview-container">
            <div className="glass-panel">
                <div className="header-section">
                    <h1 className="title">
                        <span className="sparkle">✦</span> AI Interview Simulator <span className="sparkle">✦</span>
                    </h1>
                    <p className="subtitle">Practice. Speak. Succeed.</p>
                </div>

                <div className="video-section">
                    <div className="video-wrapper">
                        <video 
                            ref={videoRef}
                            key={`video-${currentIndex}`}
                            src={`/videos/Q.${currentIndex + 1}.mp4`} 
                            autoPlay 
                            playsInline
                            style={{ width: '100%', minHeight: '40vh', backgroundColor: '#000', objectFit: 'cover' }}
                        >
                            Your browser does not support the video tag.
                        </video>
                        <button className="replay-btn" onClick={replayVideo} title="Replay Video">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="1 4 1 10 7 10"></polyline>
                                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="question-section">
                    <div className="question-indicator-container">
                        <span className="dashed-line"></span>
                        <span className="question-counter">
                            QUESTION {currentIndex + 1} OF {questions.length}
                        </span>
                        <span className="dashed-line"></span>
                    </div>

                    <h2 className="question-text">
                        <span className="quote-mark">“</span>
                        {currentQuestion.questionText}
                        <span className="quote-mark">”</span>
                    </h2>

                    <div className="status-pill-container" style={{ visibility: (!listening || isTalking || !hasSpoken) ? 'hidden' : 'visible' }}>
                        <div className="status-pill">
                            <div className="listening-indicator">
                                <svg className="mic-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                    <line x1="12" y1="19" x2="12" y2="23"></line>
                                    <line x1="8" y1="23" x2="16" y2="23"></line>
                                </svg>
                                Listening...
                            </div>
                            <div className="divider"></div>
                            <div className="timer-indicator">
                                <svg className="timer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span className="time-text">00:{countdown.toString().padStart(2, '0')} <span className="time-total">/ 20:00</span></span>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="bottom-panel">
                    <div className="controls-section">
                        {/* Question 1 */}
                        {!listening && currentIndex === 0 && (
                            <button className="btn primary-btn" onClick={startListening}>
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                    <line x1="12" y1="19" x2="12" y2="23"></line>
                                    <line x1="8" y1="23" x2="16" y2="23"></line>
                                </svg>
                                Start Speaking
                            </button>
                        )}

                        {/* Last Question */}
                        {listening && currentIndex === questions.length - 1 && (
                            <button className="btn danger-btn" onClick={stopListening}>
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                </svg>
                                Stop Speaking
                            </button>
                        )}

                        <button className="btn secondary-btn" onClick={nextQuestion}>
                            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="13 17 18 12 13 7"></polyline>
                                <polyline points="6 17 11 12 6 7"></polyline>
                            </svg>
                            {currentIndex === questions.length - 1 ? "Submit" : "Next Question"}
                        </button>
                    </div>

                    <div className="security-note">
                        <svg className="shield-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <polyline points="9 12 11 14 15 10"></polyline>
                        </svg>
                        Your responses are securely recorded and saved
                    </div>
                </div>
            </div>
        </div>
    );

}

export default InterviewPage;