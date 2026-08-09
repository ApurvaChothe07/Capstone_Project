import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./InterviewInstructions.css";

function InterviewInstructions() {
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

    const handleStartInterview = () => {
        navigate("/interview");
    };

    return (
        <div className="instructions-container">
            <div className="instructions-card">
                <h1 className="instructions-title">Interview Instructions</h1>

                <div className="instructions-content">
                    <h2 className="welcome-heading" style={{ color: "#f8fafc", marginBottom: "1rem" }}>
                        Welcome {candidateName ? candidateName : "Candidate"}!
                    </h2>
                    <p className="welcome-text">
                        Please read the following instructions carefully before starting your interview.
                    </p>

                    <ul className="instructions-list">
                        <li>
                            <strong>Environment:</strong> Ensure you are in a quiet, well-lit room with no distractions.
                        </li>
                        <li>
                            <strong>Connectivity:</strong> Check your internet connection to avoid any interruptions during the interview.
                        </li>
                        <li>
                            <strong>Camera & Microphone:</strong> Make sure your camera and microphone are working properly and grant the necessary permissions if prompted.
                        </li>
                        <li>
                            <strong>Focus:</strong> Look directly at the camera while answering to maintain eye contact.
                        </li>
                        <li>
                            <strong>Honesty:</strong> Answer all questions to the best of your knowledge. Plagiarism or cheating will lead to disqualification.
                        </li>
                        <li>
                            <strong>No Navigating Away:</strong> Do not switch tabs or open other applications during the interview.
                        </li>
                    </ul>

                    <div className="warning-box">
                        <span className="warning-icon">⚠️</span>
                        <p>Once you start the interview, you cannot pause or restart it. Please ensure you have enough time to complete it in one sitting.</p>
                    </div>
                </div>

                <button
                    onClick={handleStartInterview}
                    className="start-btn"
                >
                    I Understand, Start Interview
                </button>
            </div>
        </div>
    );
}

export default InterviewInstructions;
