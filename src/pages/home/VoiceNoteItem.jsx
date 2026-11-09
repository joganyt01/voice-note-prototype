
import { useState } from "react";
import VoicePlayer from "./VoicePlayer.jsx";

function VoiceNoteItem({
  title,
  audioUrl,
  createdAt,
  onDelete,
  onRename,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  function handleRename(event) {
    event.preventDefault();

    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle || trimmedTitle === title) {
      setIsEditing(false);
      return;
    }

    onRename(trimmedTitle);
    setIsEditing(false);
  }

  function handleCancelRename() {
    setNewTitle(title);
    setIsEditing(false);
  }

  function handleStartEditing() {
    setNewTitle(title);
    setIsEditing(true);
  }

  return (
    <article className="voice-note-item">
      <div>
        {isEditing ? (
          <form onSubmit={handleRename}>
            <input
              type="text"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              aria-label="Nuevo nombre de la nota"
              maxLength={100}
              required
            />

            <button type="submit">Guardar nombre</button>

            <button type="button" onClick={handleCancelRename}>
              Cancelar
            </button>
          </form>
        ) : (
          <>
            <h3>{title}</h3>

            <button type="button" onClick={handleStartEditing}>
              Cambiar nombre
            </button>
          </>
        )}

        <p>{createdAt}</p>
      </div>

   <VoicePlayer key={audioUrl} audioUrl={audioUrl} />

      <button type="button" onClick={onDelete}>
        Eliminar nota
      </button>
    </article>
  );
}

export default VoiceNoteItem;
