import { useNavigate } from "react-router-dom";
import "./WelcomePage.css"; // Reuse styling for consistency

function SummaryPage() {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <div className="welcome-card" style={{ textAlign: "center" }}>
                <h1 className="welcome-title">Interview Completed</h1>
                <h2 className="welcome-subtitle">Thank you for your time.</h2>
                <div style={{ marginTop: "2rem" }}>
                    <button 
                        className="next-btn" 
                        onClick={() => navigate("/feedback")}
                    >
                        Give Feedback
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SummaryPage;
