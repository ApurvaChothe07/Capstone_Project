import { BrowserRouter, Routes, Route } from "react-router-dom";

import CandidateRegistration from "./pages/CandidateRegistration";
import InterviewPage from "./pages/InterviewPage";
import SummaryPage from "./pages/SummaryPage";
import WelcomePage from "./pages/WelcomePage";
import FeedbackPage from "./pages/FeedbackPage";
import ThankYouPage from "./pages/ThankYouPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CandidateRegistration />} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/interview" element={<InterviewPage />} />
                <Route path="/summary" element={<SummaryPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/thank-you" element={<ThankYouPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;