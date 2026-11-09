
import VoiceNoteItem from "./VoiceNoteItem";

function VoiceNoteList({ notes, onDeleteNote, onRenameNote }) {
  return (
    <section className="voice-note-list">
      <h2>Mis notas de voz</h2>

      {notes.length === 0 ? (
        <p>Todavía no tienes notas de voz.</p>
      ) : (
        notes.map((note) => (
          <VoiceNoteItem
            key={note.id}
            title={note.title}
            audioUrl={note.audioUrl}
            createdAt={note.createdAt}
            onDelete={() => onDeleteNote(note.id)}
            onRename={(newTitle) =>
              onRenameNote(note.id, newTitle)
            }
          />
        ))
      )}
    </section>
  );
}

export default VoiceNoteList;
