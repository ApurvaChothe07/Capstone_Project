import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import VideoPlayer from "../components/VideoPlayer";
import "./InterviewPage.css";

function InterviewPage() {

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

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

        API.get("/questions")
            .then((response) => {

                setQuestions(response.data);

            })
            .catch((error) => {

                console.error(error);

            });

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

const nextQuestion = async () => {

    await API.post("/answers", {

        questionId: currentQuestion.id,

        answerText: (transcript + interimTranscript).trim()

    });

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
            <h1 className="title">AI Interview Simulator</h1>

            <div className="video-section">
                <VideoPlayer
                    videoName={currentQuestion.videoName}
                />
            </div>

            <div className="question-section">
                <p className="question-counter">
                    Question {currentIndex + 1} of {questions.length}
                </p>

                <h2 className="question-text">
                    {currentQuestion.questionText}
                </h2>

                <div className="countdown-text" style={{ visibility: (!listening || isTalking || !hasSpoken) ? 'hidden' : 'visible' }}>
                    Next question in {countdown} seconds
                </div>
            </div>

            <div className="transcript-section">
                <h3 className="transcript-title">Transcript</h3>
                <textarea
                    className="transcript-box"
                    value={transcript + interimTranscript}
                    readOnly
                />
            </div>
            
            <div className="controls-section">
                {/* Question 1 */}
                {!listening && currentIndex === 0 && (
                    <button
                        className="btn primary-btn"
                        onClick={startListening}
                    >
                        Start Speaking
                    </button>
                )}

                {/* Last Question */}
                {listening && currentIndex === questions.length - 1 && (
                    <button
                        className="btn danger-btn"
                        onClick={stopListening}
                    >
                        Stop Speaking
                    </button>
                )}

                <button
                    className="btn secondary-btn"
                    onClick={nextQuestion}
                >
                    Next Question
                </button>
            </div>
        </div>
    </div>
);

}

export default InterviewPage;