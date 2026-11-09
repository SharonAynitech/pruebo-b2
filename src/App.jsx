import { useEffect, useRef, useState } from 'react';
import {
  createTask,
  deleteTask,
  isValidTitle,
  loadTasks,
  saveTasks,
  toggleTaskCompleted,
  updateTaskTitle,
} from './tasks.js';
import { createFolder, loadFolders, saveFolders } from './folders.js';
import TaskItem from './TaskItem.jsx';
import ConfirmDelete from './ConfirmDelete.jsx';
import FolderManager from './FolderManager.jsx';

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [folders, setFolders] = useState(() => loadFolders());
  const [titulo, setTitulo] = useState('');
  const [error, setError] = useState('');
  // Aviso temporal tras cada cambio; `id` reinicia el temporizador si se repite el texto.
  const [notice, setNotice] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const inputRef = useRef(null);

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
    commit([createTask(titulo), ...tasks], 'Guardado');
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

  function handleCreateFolder(nombre, descripcion) {
    const next = [...folders, createFolder(nombre, descripcion)];
    saveFolders(next);
    setFolders(next);
    setNotice({ text: 'Carpeta creada', id: Date.now() });
  }

  return (
    <main className="app">
      <header>
        <h1>prueba</h1>
      </header>

      <FolderManager folders={folders} tasks={tasks} onCreate={handleCreateFolder} />

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
      </form>

      <section className="tareas" aria-labelledby="tareas-titulo">
        <h2 id="tareas-titulo">Tareas</h2>
        <ul data-testid="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onRename={handleRename}
              onToggle={handleToggle}
              onDelete={setPendingDelete}
            />
          ))}
        </ul>
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
    </main>
  );
}
