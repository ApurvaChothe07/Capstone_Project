import { BrowserRouter, Routes, Route } from "react-router-dom";

import CandidateRegistration from "./pages/CandidateRegistration";
import InterviewPage from "./pages/InterviewPage";
import SummaryPage from "./pages/SummaryPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CandidateRegistration />} />
                <Route path="/interview" element={<InterviewPage />} />
                <Route path="/summary" element={<SummaryPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;