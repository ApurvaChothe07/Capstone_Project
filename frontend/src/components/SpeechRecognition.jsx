import { useRef, useState } from "react";

function SpeechRecognition({ transcript, setTranscript }) {

    const recognitionRef = useRef(null);
    const [listening, setListening] = useState(false);

    const startListening = () => {
        const SpeechRecognitionAPI =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            alert("Speech Recognition is not supported");
            return;
        }

        const recognition = new SpeechRecognitionAPI();

        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let text = "";

            for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript;
            }

            setTranscript(text);
        };

        recognition.start();

        recognitionRef.current = recognition;
        setListening(true);
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setListening(false);
        }
    };

    return (
        <div>
            {!listening ? (
                <button onClick={startListening}>
                    Start Speaking
                </button>
            ) : (
                <button onClick={stopListening}>
                    Stop Speaking
                </button>
            )}

            <h3>Transcript</h3>

            <textarea
                rows="8"
                cols="80"
                value={transcript}
                readOnly
            />
        </div>
    );
}

export default SpeechRecognition;