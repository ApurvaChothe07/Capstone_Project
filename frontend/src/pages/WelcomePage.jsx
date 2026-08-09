import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomePage.css";

function WelcomePage() {
    const navigate = useNavigate();
    const [candidateName, setCandidateName] = useState("");

    useEffect(() => {
        const storedCandidate = localStorage.getItem("candidate");
        if (storedCandidate) {
            try {
                const parsedCandidate = JSON.parse(storedCandidate);
                if (parsedCandidate && parsedCandidate.name) {
                    setCandidateName(parsedCandidate.name);
                }
            } catch (e) {
                console.error("Error parsing candidate data:", e);
            }
        }
    }, []);

    const handleNext = () => {
        navigate("/interview");
    };

    return (
        <div className="welcome-container">
            <div className="welcome-card">
                <h1 className="welcome-title">Welcome</h1>
                
                <h2 className="welcome-subtitle">
                    Welcome, {candidateName ? candidateName : "Candidate"}
                </h2>

                <div className="welcome-content">
                    <h3 className="instructions-heading">Interview Instructions</h3>
                    
                    <ul className="instructions-list">
                        <li>
                            <span className="icon">🎤</span>
                            <p>Make sure your microphone is working properly before starting the interview and keep your microphone enabled throughout the interview.</p>
                        </li>
                        <li>
                            <span className="icon">💡</span>
                            <p>Sit in a quiet and well-lit environment.</p>
                        </li>
                        <li>
                            <span className="icon">👂</span>
                            <p>Read/listen to each question carefully.</p>
                        </li>
                        <li>
                            <span className="icon">🗣️</span>
                            <p>Answer the questions clearly and confidently.</p>
                        </li>
                        <li>
                            <span className="icon">⏱️</span>
                            <p><strong>Silence Timer:</strong> When you stop speaking, a silence timer will appear. If you start speaking again, the timer will automatically stop. Please continue answering naturally.</p>
                        </li>
                        <li>
                            <span className="icon">🚫</span>
                            <p>Do not refresh or close the page during the interview.</p>
                        </li>
                        <li>
                            <span className="icon">➡️</span>
                            <p><strong>Next Question:</strong> Click the "Next Question" button to continue, or wait for the silence countdown to finish and the interview will automatically move to the next question.</p>
                        </li>
                    </ul>
                </div>

                <button 
                    onClick={handleNext} 
                    className="next-btn"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default WelcomePage;
