import { useEffect, useRef, useState } from 'react';
import { isValidFolderName } from './folders.js';
import { formatDate } from './tasks.js';
import { PencilIcon, TrashIcon } from './TaskItem.jsx';

function taskCountLabel(n) {
  return n === 1 ? '1 tarea' : `${n} tareas`;
}

export default function FolderItem({ folder, taskCount, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(folder.nombre);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const renameButtonRef = useRef(null);
  // Tras salir de la edición, el foco vuelve al botón Renombrar.
  const returnFocus = useRef(false);
  const errorId = `carpeta-renombrar-error-${folder.id}`;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (returnFocus.current) {
      returnFocus.current = false;
      renameButtonRef.current?.focus();
    }
  }, [editing]);

  function startEditing() {
    setDraft(folder.nombre);
    setError('');
    setEditing(true);
  }

  function stopEditing() {
    returnFocus.current = true;
    setEditing(false);
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!isValidFolderName(draft)) {
      setError('El nombre es obligatorio');
      inputRef.current?.focus();
      return;
    }
    onRename(folder.id, draft);
    stopEditing();
  }

  return (
    <li data-testid="folder-item">
      {editing ? (
        <form className="edicion" onSubmit={handleSubmit} noValidate>
          <div className="fila">
            <input
              ref={inputRef}
              name="carpeta-renombrar"
              type="text"
              autoComplete="off"
              aria-label={`Nuevo nombre para ${folder.nombre}`}
              value={draft}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') stopEditing();
              }}
            />
            <button type="submit" data-testid="folder-save">
              Guardar
            </button>
            <button type="button" className="secundario" onClick={stopEditing}>
              Cancelar
            </button>
          </div>
          {error && (
            <p id={errorId} className="error" role="alert">
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="carpeta">
          <div className="carpeta-texto">
            <span data-testid="folder-name" className="carpeta-nombre">
              {folder.nombre}
            </span>
            {folder.descripcion && <span className="carpeta-descripcion">{folder.descripcion}</span>}
            <span className="carpeta-meta">
              <span data-testid="folder-count">{taskCountLabel(taskCount)}</span>
              {folder.fecha_creacion && (
                <>
                  {' · '}
                  <time dateTime={folder.fecha_creacion}>{formatDate(folder.fecha_creacion)}</time>
                </>
              )}
            </span>
          </div>
          <button
            ref={renameButtonRef}
            type="button"
            className="secundario"
            data-testid="folder-rename"
            aria-label={`Renombrar ${folder.nombre}`}
            onClick={startEditing}
          >
            <PencilIcon />
            Renombrar
          </button>
          <button
            type="button"
            className="secundario icono"
            data-testid="folder-delete"
            aria-label={`Eliminar ${folder.nombre}`}
            title="Eliminar"
            onClick={() => onDelete(folder)}
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </li>
  );
}
