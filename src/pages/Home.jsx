
import { useEffect, useRef, useState } from "react";

import HomeHeader from "./home/HomeHeader";
import VoiceRecorder from "./home/VoiceRecorder";
import VoiceNoteList from "./home/VoiceNoteList";

import {
  getStoredNotes,
  saveStoredNote,
  deleteStoredNote,
} from "../services/storage";

function Home() {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");
  const notesRef = useRef([]);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      notesRef.current.forEach((note) => {
        URL.revokeObjectURL(note.audioUrl);
      });
    };
  }, []);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    let isMounted = true;
    let loadedNotes = [];

    async function loadNotes() {
      try {
        const storedNotes = await getStoredNotes();

        loadedNotes = storedNotes.map((note) => ({
          ...note,
          audioUrl: URL.createObjectURL(note.audioBlob),
        }));

        if (isMounted) {
          setNotes(loadedNotes);
          setError("");
        } else {
          loadedNotes.forEach((note) => {
            URL.revokeObjectURL(note.audioUrl);
          });
        }
      } catch (error) {
        console.error("Error al recuperar las notas:", error);

        if (isMounted) {
          setError("No se pudieron cargar las notas guardadas.");
        }
      }
    }

    loadNotes();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSaveNote(audioBlob) {
    const newNote = {
      id: crypto.randomUUID(),
      title: `Nota de voz ${notesRef.current.length + 1}`,
      audioBlob,
      createdAt: new Date().toLocaleString(),
    };

    try {
      await saveStoredNote(newNote);

      if (!isMountedRef.current) return;

      const audioUrl = URL.createObjectURL(audioBlob);

      setNotes((currentNotes) => [
        ...currentNotes,
        { ...newNote, audioUrl },
      ]);

      setError("");
    } catch (error) {
      console.error("Error al guardar la nota:", error);
      throw error;
    }
  }

  async function handleDeleteNote(noteId) {
    const noteToDelete = notesRef.current.find(
      (note) => note.id === noteId
    );

    if (!noteToDelete) return;

    try {
      await deleteStoredNote(noteId);

      if (!isMountedRef.current) return;

      setNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== noteId)
      );

      URL.revokeObjectURL(noteToDelete.audioUrl);
      setError("");
    } catch (error) {
      console.error("Error al eliminar la nota:", error);
      setError("No se pudo eliminar la nota. Intenta nuevamente.");
    }
  }

  async function handleRenameNote(noteId, newTitle) {
    const noteToRename = notesRef.current.find(
      (note) => note.id === noteId
    );

    if (!noteToRename) return;

    const updatedNote = {
      id: noteToRename.id,
      title: newTitle,
      audioBlob: noteToRename.audioBlob,
      createdAt: noteToRename.createdAt,
    };

    try {
      await saveStoredNote(updatedNote);

      if (!isMountedRef.current) return;

      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === noteId
            ? { ...note, title: newTitle }
            : note
        )
      );

      setError("");
    } catch (error) {
      console.error("Error al cambiar el nombre:", error);
      setError("No se pudo cambiar el nombre de la nota.");
    }
  }

  return (
    <main className="main-content">
      <HomeHeader />

      {error && <p role="alert">{error}</p>}

      <VoiceRecorder onSave={handleSaveNote} />

      <VoiceNoteList
        notes={notes}
        onDeleteNote={handleDeleteNote}
        onRenameNote={handleRenameNote}
      />
    </main>
  );
}

export default Home;
