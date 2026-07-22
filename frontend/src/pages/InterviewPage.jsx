import { useEffect, useState } from "react";
import API from "../services/api";
import VideoPlayer from "../components/VideoPlayer";
import SpeechRecognition from "../components/SpeechRecognition";

function InterviewPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [completed, setCompleted] = useState(false);


  useEffect(() => {
    API.get("/questions")
      .then((response) => {
        setQuestions(response.data);
      })
      .catch(console.error);
  }, []);

if (completed) {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Interview Completed ✅</h1>
      <p>Thank you for attending the interview.</p>
    </div>
  );
}
  if (questions.length === 0) {
    return <h2>Loading...</h2>;
  }

  const currentQuestion = questions[currentIndex];
  const nextQuestion = async () => {

        await API.post("/answers", {
            questionId: currentQuestion.id,
            answerText: transcript
        });

        setTranscript("");

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCompleted(true);
        }
    };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Interview Simulator</h1>

      <VideoPlayer
        videoName={currentQuestion.videoName}
      />
      <h3>
          Question {currentIndex + 1} of {questions.length}
      </h3>

      <h2>
        {currentQuestion.questionText}
      </h2>

     <SpeechRecognition
         transcript={transcript}
         setTranscript={setTranscript}
     />
     <button
         onClick={nextQuestion}
         style={{
             marginTop: "20px",
             padding: "10px 20px"
         }}
     >
         Next Question
     </button>
    </div>
  );
}

export default InterviewPage;