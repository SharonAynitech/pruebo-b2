import { useEffect, useRef, useState } from 'react';
import { formatDate, isValidTitle } from './tasks.js';

export function PencilIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default function TaskItem({ task, onRename, onToggle, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.titulo);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const errorId = `edicion-error-${task.id}`;

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEditing() {
    setDraft(task.titulo);
    setError('');
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!isValidTitle(draft)) {
      setError('El título es obligatorio');
      inputRef.current?.focus();
      return;
    }
    onRename(task.id, draft);
    setEditing(false);
  }

  return (
    <li
      data-testid="task-item"
      data-completed={task.completada ? 'true' : 'false'}
      className={task.completada ? 'completada' : undefined}
    >
      {editing ? (
        <form className="edicion" onSubmit={handleSubmit} noValidate>
          <div className="fila">
            <input
              ref={inputRef}
              name="titulo-edicion"
              type="text"
              autoComplete="off"
              aria-label="Editar título"
              value={draft}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancel();
              }}
            />
            <button type="submit" data-testid="task-save">
              Guardar
            </button>
            <button type="button" className="secundario" onClick={cancel}>
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
        <div className="tarea">
          <input
            type="checkbox"
            data-testid="task-toggle"
            aria-label={`Completada: ${task.titulo}`}
            checked={task.completada}
            onChange={() => onToggle(task.id)}
          />
          <div className="tarea-texto">
            <span data-testid="task-title" className="titulo">
              {task.titulo}
            </span>
            <time data-testid="task-date" dateTime={task.fecha_creacion}>
              {formatDate(task.fecha_creacion)}
            </time>
          </div>
          <button
            type="button"
            className="secundario"
            data-testid="task-edit"
            onClick={startEditing}
          >
            <PencilIcon />
            Editar
          </button>
          <button
            type="button"
            className="secundario icono"
            data-testid="task-delete"
            aria-label="Eliminar"
            title="Eliminar"
            onClick={() => onDelete(task)}
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </li>
  );
}
