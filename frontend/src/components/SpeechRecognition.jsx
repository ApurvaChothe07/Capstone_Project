function SpeechRecognition({ transcript }) {
    return (
        <div style={{ marginTop: "20px" }}>
            <h3>Transcript</h3>

            <textarea
                rows="8"
                cols="80"
                value={transcript}
                readOnly
                style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px"
                }}
            />
        </div>
    );
}

export default SpeechRecognition;