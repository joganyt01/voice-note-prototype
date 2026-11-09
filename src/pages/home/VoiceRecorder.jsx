
import { useEffect, useRef, useState } from "react";
import VoicePlayer from "./VoicePlayer.jsx";

function VoiceRecorder({ onSave }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState("");

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const audioUrlRef = useRef(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }

      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  async function startRecording() {
    if (isStarting || isRecording) return;

    setIsStarting(true);

    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "Este navegador no permite acceder al micrófono en esta página."
        );
        return;
      }

      const previousUrl = audioUrlRef.current;

      audioUrlRef.current = null;
      setAudioUrl(null);

      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      console.log("Formato MIME:", recorder.mimeType);

console.log(
  "WebM compatible:",
  MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
);

console.log(
  "MP4 compatible:",
  MediaRecorder.isTypeSupported("audio/mp4")
);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        if (isMountedRef.current) {
          setError("Ocurrió un error durante la grabación.");
          setIsRecording(false);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (streamRef.current === stream) {
          streamRef.current = null;
        }

        if (!isMountedRef.current) return;

        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        chunksRef.current = [];

        if (audioBlob.size === 0) {
          setError("La grabación está vacía. Intenta nuevamente.");
          return;
        }

        const url = URL.createObjectURL(audioBlob);

        audioUrlRef.current = url;
        setAudioUrl(url);

        try {
          await onSave(audioBlob);
        } catch {
          if (isMountedRef.current) {
            setError(
              "No se pudo guardar la nota. Intenta nuevamente."
            );
          }
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;

      if (isMountedRef.current) {
        if (error.name === "NotAllowedError") {
          setError(
            "No se pudo acceder al micrófono. Revisa los permisos del navegador."
          );
        } else {
          setError(
            "No se pudo iniciar la grabación. Comprueba el micrófono e intenta nuevamente."
          );
        }

        setIsRecording(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsStarting(false);
      }
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;

    if (recorder?.state === "recording") {
      recorder.stop();
      setIsRecording(false);
    }
  }

  return (
    <section className="voice-recorder">
      <h2>Tu nota de voz</h2>
      <p>Graba una nota y escúchala antes de guardarla.</p>

      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isStarting}
      >
        {isStarting
          ? "Preparando micrófono..."
          : isRecording
            ? "Detener grabación"
            : "Iniciar grabación"}
      </button>

      {isRecording && <p>Grabando audio...</p>}

      {error && <p role="alert">{error}</p>}

     {audioUrl && (
  <div>
    <p>Vista previa de tu grabación:</p>
    <VoicePlayer audioUrl={audioUrl} />
  </div>
)}
    </section>
  );
}

export default VoiceRecorder;
