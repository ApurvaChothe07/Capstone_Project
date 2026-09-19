import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./FeedbackPage.css";

const questions = [
    {
        id: "q1",
        text: "How confident did you feel while answering the interview questions?",
        type: "positive"
    },
    {
        id: "q2",
        text: "How confident were you when answering questions you were unsure about?",
        type: "positive"
    },
    {
        id: "q3",
        text: "How focused were you throughout the interview?",
        type: "positive"
    },
    {
        id: "q4",
        text: "How well were you able to understand the interviewer’s questions?",
        type: "positive"
    },
    {
        id: "q5",
        text: "How nervous did you feel during the interview?",
        type: "negative"
    },
    {
        id: "q6",
        text: "Did nervousness affect the way you answered any question?",
        type: "negative"
    },
    {
        id: "q7",
        text: "How well do you think you maintained eye contact with the interviewer?",
        type: "positive"
    },
    {
        id: "q8",
        text: "How clearly do you think you communicated your ideas?",
        type: "positive"
    },
    {
        id: "q9",
        text: "How smoothly do you think you spoke during the interview?",
        type: "positive"
    },
    {
        id: "q10",
        text: "How satisfied are you with your overall interview performance?",
        type: "positive"
    }
];

function FeedbackPage() {

    const navigate = useNavigate();

    const [feedback, setFeedback] = useState({
        q1: null,
        q2: null,
        q3: null,
        q4: null,
        q5: null,
        q6: null,
        q7: null,
        q8: null,
        q9: null,
        q10: null
    });

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleRatingSelect = (questionId, rating) => {

        console.log(
            "Selected rating:",
            questionId,
            rating
        );

        setFeedback((previous) => ({
            ...previous,
            [questionId]: rating
        }));

        setError("");
    };


    const handleSubmit = async (event) => {

        // Prevent normal HTML form submission
        if (event) {
            event.preventDefault();
        }

        console.log("=================================");
        console.log("SUBMIT FEEDBACK BUTTON CLICKED");
        console.log("=================================");

        // Prevent double submission
        if (submitting) {
            console.log("Already submitting. Ignoring click.");
            return;
        }

        // Check whether all questions are answered
        const unanswered = questions.filter(
            (question) =>
                feedback[question.id] === null
        );

        console.log(
            "Unanswered questions:",
            unanswered
        );

        if (unanswered.length > 0) {

            console.log(
                "Feedback submission stopped because some questions are unanswered."
            );

            setError(
                "Please answer all questions before submitting your feedback."
            );

            const firstUnanswered =
                document.getElementById(
                    unanswered[0].id
                );

            if (firstUnanswered) {

                firstUnanswered.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            return;
        }


        // Get session ID created by InterviewPage
        const storedSessionId =
            localStorage.getItem(
                "interviewSessionId"
            );

        console.log(
            "Stored interviewSessionId:",
            storedSessionId
        );


        if (!storedSessionId) {

            console.error(
                "No interviewSessionId found in localStorage."
            );

            setError(
                "Interview session not found. Please restart the interview."
            );

            return;
        }


        const sessionId =
            Number(storedSessionId);


        if (Number.isNaN(sessionId)) {

            console.error(
                "Invalid session ID:",
                storedSessionId
            );

            setError(
                "Invalid interview session. Please restart the interview."
            );

            return;
        }


        // Start submitting
        setSubmitting(true);
        setError("");


        const feedbackData = {

            sessionId: sessionId,

            q1: feedback.q1,
            q2: feedback.q2,
            q3: feedback.q3,
            q4: feedback.q4,
            q5: feedback.q5,
            q6: feedback.q6,
            q7: feedback.q7,
            q8: feedback.q8,
            q9: feedback.q9,
            q10: feedback.q10
        };


        console.log(
            "Sending feedback data:",
            feedbackData
        );


        try {

            const response =
                await API.post(
                    "/feedback",
                    feedbackData
                );


            console.log(
                "Feedback saved successfully:",
                response.data
            );


            console.log(
                "Navigating to /thank-you..."
            );


            navigate("/thank-you");


        } catch (err) {

            console.error(
                "Failed to save feedback:",
                err
            );


            if (err.response) {

                console.error(
                    "Backend status:",
                    err.response.status
                );

                console.error(
                    "Backend response:",
                    err.response.data
                );
            }


            setError(
                "Failed to save feedback. Please try again."
            );

            setSubmitting(false);
        }
    };


    return (
        <div className="feedback-container">

            <div className="feedback-card">

                <h1 className="feedback-title">
                    Post-Interview Feedback
                </h1>

                <h2 className="feedback-subtitle">
                    Please share your experience to help us understand your interview performance.
                </h2>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <div className="questions-container">

                    {questions.map((question, index) => {

                        const isUnanswered =
                            error &&
                            feedback[question.id] === null;


                        return (
                            <div
                                key={question.id}
                                id={question.id}
                                className={
                                    `question-block ${
                                        isUnanswered
                                            ? "unanswered-highlight"
                                            : ""
                                    }`
                                }
                            >

                                <p className="question-text">

                                    <strong>
                                        {index + 1}.
                                    </strong>{" "}

                                    {question.text}

                                </p>


                                <div className="rating-options">

                                    {[1, 2, 3, 4, 5].map(
                                        (rating) => (

                                            <button
                                                type="button"
                                                key={rating}
                                                className={
                                                    `rating-btn ${
                                                        feedback[
                                                            question.id
                                                        ] === rating
                                                            ? "active"
                                                            : ""
                                                    }`
                                                }
                                                onClick={() =>
                                                    handleRatingSelect(
                                                        question.id,
                                                        rating
                                                    )
                                                }
                                            >
                                                {rating}
                                            </button>

                                        )
                                    )}

                                </div>


                                <div className="rating-labels">

                                    {question.type === "positive" ? (

                                        <>
                                            <span>
                                                Very Low
                                            </span>

                                            <span>
                                                Low
                                            </span>

                                            <span>
                                                Moderate
                                            </span>

                                            <span>
                                                High
                                            </span>

                                            <span>
                                                Very High
                                            </span>
                                        </>

                                    ) : (

                                        <>
                                            <span>
                                                Not at all
                                            </span>

                                            <span>
                                                Slightly
                                            </span>

                                            <span>
                                                Moderately
                                            </span>

                                            <span>
                                                Very
                                            </span>

                                            <span>
                                                Extremely
                                            </span>
                                        </>

                                    )}

                                </div>

                            </div>
                        );
                    })}

                </div>


                <button
                    type="button"
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={submitting}
                >

                    {submitting
                        ? "Saving Feedback..."
                        : "Submit Feedback"}

                </button>

            </div>

        </div>
    );
}

export default FeedbackPage;