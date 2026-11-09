import { useEffect, useRef } from 'react';

function cascadeText(n) {
  if (n === 0) return 'La carpeta no tiene tareas.';
  if (n === 1) return 'También se eliminará 1 tarea de esta carpeta.';
  return `También se eliminarán ${n} tareas de esta carpeta.`;
}

// Diálogo modal para confirmar la eliminación de una carpeta y sus tareas.
export default function ConfirmDeleteFolder({ folder, taskCount, onConfirm, onCancel }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (folder && !dialog.open) dialog.showModal();
    if (!folder && dialog.open) dialog.close();
  }, [folder]);

  return (
    <dialog
      ref={dialogRef}
      className="confirmar"
      data-testid="delete-folder-dialog"
      aria-labelledby="confirmar-carpeta-titulo"
      aria-describedby="confirmar-carpeta-texto"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <h2 id="confirmar-carpeta-titulo">¿Eliminar la carpeta?</h2>
      <p id="confirmar-carpeta-texto">
        {folder && (
          <>
            <strong className="confirmar-nombre">{folder.nombre}</strong>
            <br />
            <span data-testid="delete-folder-count">{cascadeText(taskCount)}</span>{' '}
          </>
        )}
        Esta acción no se puede deshacer.
      </p>
      <div className="acciones">
        <button type="button" className="secundario" onClick={onCancel} autoFocus>
          Cancelar
        </button>
        <button
          type="button"
          className="peligro"
          data-testid="confirm-delete-folder"
          onClick={() => onConfirm(folder.id)}
        >
          Eliminar
        </button>
      </div>
    </dialog>
  );
}
