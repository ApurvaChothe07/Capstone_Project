function VideoPlayer({ videoName }) {
    return (
        <video
            key={videoName}
            src={`/videos/${videoName}`}
            controls
            autoPlay
            playsInline
            style={{
                width: "100%",
                height: "100%",
                borderRadius: "10px",
                objectFit: "contain",
                display: "block",
                backgroundColor: "#000",
            }}
        />
    );
}

export default VideoPlayer;