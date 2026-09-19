import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FeedbackPage.css";

const questions = [
  { id: "q1", text: "How confident did you feel while answering the interview questions?", type: "positive" },
  { id: "q2", text: "How confident were you when answering questions you were unsure about?", type: "positive" },
  { id: "q3", text: "How focused were you throughout the interview?", type: "positive" },
  { id: "q4", text: "How well were you able to understand the interviewer’s questions?", type: "positive" },
  { id: "q5", text: "How nervous did you feel during the interview?", type: "negative" },
  { id: "q6", text: "Did nervousness affect the way you answered any question?", type: "negative" },
  { id: "q7", text: "How well do you think you maintained eye contact with the interviewer?", type: "positive" },
  { id: "q8", text: "How clearly do you think you communicated your ideas?", type: "positive" },
  { id: "q9", text: "How smoothly do you think you spoke during the interview?", type: "positive" },
  { id: "q10", text: "How satisfied are you with your overall interview performance?", type: "positive" }
];

function FeedbackPage() {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState({
        q1: null, q2: null, q3: null, q4: null, q5: null,
        q6: null, q7: null, q8: null, q9: null, q10: null
    });
    const [error, setError] = useState("");

    const handleRatingSelect = (questionId, rating) => {
        setFeedback(prev => ({
            ...prev,
            [questionId]: rating
        }));
        setError(""); // Clear error when user makes a selection
    };

    const handleSubmit = () => {
        // Validate all questions are answered
        const unanswered = questions.filter(q => feedback[q.id] === null);
        
        if (unanswered.length > 0) {
            setError("Please answer all questions before submitting your feedback.");
            // Scroll to the first unanswered question
            const firstUnanswered = document.getElementById(unanswered[0].id);
            if (firstUnanswered) {
                firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Move to Thank You page
        navigate("/thank-you");
    };

    return (
        <div className="feedback-container">
            <div className="feedback-card">
                <h1 className="feedback-title">Post-Interview Feedback</h1>
                <h2 className="feedback-subtitle">
                    Please share your experience to help us understand your interview performance.
                </h2>

                {error && <div className="error-message">{error}</div>}

                <div className="questions-container">
                    {questions.map((q, index) => {
                        const isUnanswered = error && feedback[q.id] === null;
                        return (
                            <div 
                                key={q.id} 
                                id={q.id}
                                className={`question-block ${isUnanswered ? 'unanswered-highlight' : ''}`}
                            >
                                <p className="question-text">
                                    <strong>{index + 1}.</strong> {q.text}
                                </p>
                                <div className="rating-options">
                                    {[1, 2, 3, 4, 5].map(rating => (
                                        <button
                                            key={rating}
                                            className={`rating-btn ${feedback[q.id] === rating ? 'active' : ''}`}
                                            onClick={() => handleRatingSelect(q.id, rating)}
                                        >
                                            {rating}
                                        </button>
                                    ))}
                                </div>
                                <div className="rating-labels">
                                    {q.type === 'positive' ? (
                                        <>
                                            <span>Very Low</span>
                                            <span>Low</span>
                                            <span>Moderate</span>
                                            <span>High</span>
                                            <span>Very High</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Not at all</span>
                                            <span>Slightly</span>
                                            <span>Moderately</span>
                                            <span>Very</span>
                                            <span>Extremely</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button className="submit-btn" onClick={handleSubmit}>
                    Submit Feedback
                </button>
            </div>
        </div>
    );
}

export default FeedbackPage;
