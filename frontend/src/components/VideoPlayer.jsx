function VideoPlayer({ videoName }) {
  return (
    <video
      key={videoName}
      src={`/videos/${videoName}`}
      width="250"
      height="250"
      controls
      autoPlay
      style={{
        borderRadius: "10px",
        objectFit: "cover",
      }}
    />
  );
}

export default VideoPlayer;