import { useNavigate } from "react-router-dom";
import "./FeedbackPage.css"; // Reusing the same styling

function ThankYouPage() {
    const navigate = useNavigate();

    return (
        <div className="feedback-container">
            <div className="feedback-card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
                <h1 className="feedback-title">Thank You!</h1>
                <h2 className="feedback-subtitle" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: "1.5rem" }}>
                    Thank you for completing the interview and sharing your feedback.
                </h2>
                <p style={{ color: "#cbd5e1", marginBottom: "3rem", fontSize: "1.1rem" }}>
                    Your feedback helps us improve the interview experience.
                </p>
                <button 
                    className="submit-btn" 
                    onClick={() => navigate("/")}
                >
                    Finish
                </button>
            </div>
        </div>
    );
}

export default ThankYouPage;
