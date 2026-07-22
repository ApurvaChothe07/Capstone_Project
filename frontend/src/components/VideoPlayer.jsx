function VideoPlayer({ videoName }) {
  return (
    <video
      width="250"
      height="250"
      controls
      autoPlay
      style={{
        borderRadius: "10px",
        objectFit: "cover"
      }}
    >
      <source
        src={`/videos/${videoName}`}
        type="video/mp4"
      />
    </video>
  );
}

export default VideoPlayer;