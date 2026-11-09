import { useEffect, useRef, useState } from 'react';
import {
  assignTasksToFolder,
  createTask,
  deleteTask,
  groupTasksByFolder,
  isValidTitle,
  loadTasks,
  saveTasks,
  toggleTaskCompleted,
  updateTaskTitle,
} from './tasks.js';
import {
  countTasksInFolder,
  createFolder,
  deleteFolder,
  loadFolders,
  renameFolder,
  saveFolders,
} from './folders.js';
import TaskTable from './TaskTable.jsx';
import TaskBoard from './TaskBoard.jsx';
import SelectionBar from './SelectionBar.jsx';
import ConfirmDelete from './ConfirmDelete.jsx';
import ConfirmDeleteFolder from './ConfirmDeleteFolder.jsx';
import FolderManager from './FolderManager.jsx';

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [folders, setFolders] = useState(() => loadFolders());
  const [titulo, setTitulo] = useState('');
  const [carpetaId, setCarpetaId] = useState('');
  const [error, setError] = useState('');
  // Aviso temporal tras cada cambio; `id` reinicia el temporizador si se repite el texto.
  const [notice, setNotice] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingFolderDelete, setPendingFolderDelete] = useState(null);
  const [view, setView] = useState('tabla');
  const [selection, setSelection] = useState(() => new Set());
  const inputRef = useRef(null);

  // Solo cuentan las seleccionadas que siguen existiendo (p. ej. tras eliminar una tarea).
  const selected = new Set(tasks.filter((t) => selection.has(t.id)).map((t) => t.id));
  const groups = groupTasksByFolder(tasks, folders);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  function commit(next, text) {
    saveTasks(next);
    setTasks(next);
    setNotice({ text, id: Date.now() });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!isValidTitle(titulo)) {
      setError('El título es obligatorio');
      inputRef.current?.focus();
      return;
    }
    const carpeta = folders.some((f) => f.id === carpetaId) ? carpetaId : null;
    commit([createTask(titulo, new Date(), carpeta), ...tasks], 'Guardado');
    setTitulo('');
    setError('');
  }

  function handleRename(id, nuevoTitulo) {
    commit(updateTaskTitle(tasks, id, nuevoTitulo), 'Guardado');
  }

  function handleToggle(id) {
    commit(toggleTaskCompleted(tasks, id), 'Guardado');
  }

  function handleDelete(id) {
    commit(deleteTask(tasks, id), 'Tarea eliminada');
    setPendingDelete(null);
  }

  function handleSelect(id, checked) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleAssign(destino) {
    const n = selected.size;
    commit(
      assignTasksToFolder(tasks, [...selected], destino),
      n === 1 ? 'Tarea asignada' : `${n} tareas asignadas`,
    );
    setSelection(new Set());
  }

  function changeView(next) {
    setView(next);
    setSelection(new Set());
  }

  function commitFolders(next, text) {
    saveFolders(next);
    setFolders(next);
    setNotice({ text, id: Date.now() });
  }

  function handleCreateFolder(nombre, descripcion) {
    commitFolders([...folders, createFolder(nombre, descripcion)], 'Carpeta creada');
  }

  function handleRenameFolder(id, nombre) {
    commitFolders(renameFolder(folders, id, nombre), 'Carpeta renombrada');
  }

  function handleDeleteFolder(id) {
    const next = deleteFolder(folders, tasks, id);
    saveTasks(next.tasks);
    setTasks(next.tasks);
    commitFolders(next.folders, 'Carpeta eliminada');
    if (carpetaId === id) setCarpetaId('');
    setPendingFolderDelete(null);
  }

  return (
    <main className="app">
      <header>
        <h1>prueba</h1>
      </header>

      <FolderManager
        folders={folders}
        tasks={tasks}
        onCreate={handleCreateFolder}
        onRename={handleRenameFolder}
        onDelete={setPendingFolderDelete}
      />

      <form className="crear" onSubmit={handleSubmit} noValidate>
        <label htmlFor="titulo">Título</label>
        <div className="crear-fila">
          <input
            ref={inputRef}
            id="titulo"
            name="titulo"
            type="text"
            autoComplete="off"
            value={titulo}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'titulo-error' : undefined}
            onChange={(e) => {
              setTitulo(e.target.value);
              if (error) setError('');
            }}
          />
          <button type="submit">Crear</button>
        </div>
        {error && (
          <p id="titulo-error" className="error" role="alert">
            {error}
          </p>
        )}
        <label htmlFor="carpeta">
          Carpeta <span className="opcional">(opcional)</span>
        </label>
        <select
          id="carpeta"
          name="carpeta"
          aria-describedby="carpeta-ayuda"
          value={carpetaId}
          onChange={(e) => setCarpetaId(e.target.value)}
        >
          <option value="">Sin carpeta</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.nombre}
            </option>
          ))}
        </select>
        <p id="carpeta-ayuda" className="ayuda">
          La tarea quedará en la carpeta que elijas. Déjalo en «Sin carpeta» para crearla sin
          agrupar.
        </p>
      </form>

      <section className="tareas" aria-labelledby="tareas-titulo">
        <div className="tareas-cabecera">
          <h2 id="tareas-titulo">Tareas</h2>
          <div className="vistas" role="group" aria-label="Vista">
            <button
              type="button"
              className="secundario"
              data-testid="view-table"
              aria-pressed={view === 'tabla'}
              onClick={() => changeView('tabla')}
            >
              Tabla
            </button>
            <button
              type="button"
              className="secundario"
              data-testid="view-board"
              aria-pressed={view === 'tablero'}
              onClick={() => changeView('tablero')}
            >
              Tablero
            </button>
          </div>
        </div>

        {view === 'tabla' && selected.size > 0 && (
          <SelectionBar
            count={selected.size}
            folders={folders}
            onAssign={handleAssign}
            onClear={() => setSelection(new Set())}
          />
        )}

        {view === 'tabla' ? (
          <TaskTable
            groups={groups}
            selected={selected}
            onSelect={handleSelect}
            onRename={handleRename}
            onToggle={handleToggle}
            onDelete={setPendingDelete}
          />
        ) : (
          <TaskBoard groups={groups} />
        )}
      </section>

      {/* La región viva existe siempre para que los lectores de pantalla anuncien cada aviso. */}
      <div role="status" aria-live="polite">
        {notice && (
          <p key={notice.id} className="snackbar" data-testid="snackbar">
            {notice.text}
          </p>
        )}
      </div>

      <ConfirmDelete
        task={pendingDelete}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDeleteFolder
        folder={pendingFolderDelete}
        taskCount={pendingFolderDelete ? countTasksInFolder(tasks, pendingFolderDelete.id) : 0}
        onConfirm={handleDeleteFolder}
        onCancel={() => setPendingFolderDelete(null)}
      />
    </main>
  );
}
