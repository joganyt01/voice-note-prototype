
import { useRef, useState } from "react";
import "./VoicePlayer.css";



function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function VoicePlayer({ audioUrl }) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);


  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error("No se pudo reproducir el audio:", error);
      }
    } else {
      audio.pause();
    }
  }

  function handleTimeUpdate() {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }
  function handleLoadedMetadata() {
    if (audioRef.current) {
      console.log("Duración detectada:", audioRef.current.duration);
      console.log("Estado del audio:", audioRef.current.readyState);
      console.log("Formato del audio:", audioRef.current.currentSrc);

      setDuration(audioRef.current.duration);
    }
  }

  function handleSeek(event) {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration)) return;

    const newTime = Number(event.target.value);

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }
  function handleEnded() {
    console.log("Audio terminado");
    console.log("Duración final:", audioRef.current?.duration);
    console.log("Tiempo final:", audioRef.current?.currentTime);

    setIsPlaying(false);
    setCurrentTime(0);
  }

  return (
    <div className="voice-player">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => {
          console.log("Error de reproducción:", audioRef.current?.error);
        }}
        onDurationChange={() => {
          console.log("Cambio de duración:", audioRef.current?.duration);
        }}
      />

      <button
        type="button"
        className="voice-player__play"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
      >
        {isPlaying ? "Ⅱ" : "▶"}
      </button>

      <div className="voice-player__timeline">
        <input
          className="voice-player__progress"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={handleSeek}
          disabled={!duration}
          aria-label="Posición del audio"
          style={{
            "--progress": duration
              ? `${(currentTime / duration) * 100}%`
              : "0%",
          }}
        />

        <div className="voice-player__times">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

export default VoicePlayer;
