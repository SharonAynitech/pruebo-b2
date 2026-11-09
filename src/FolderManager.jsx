import { useRef, useState } from 'react';
import { countTasksInFolder, isValidFolderName } from './folders.js';
import { formatDate } from './tasks.js';

function taskCountLabel(n) {
  return n === 1 ? '1 tarea' : `${n} tareas`;
}

export default function FolderManager({ folders, tasks, onCreate }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const nombreRef = useRef(null);

  function reset() {
    setNombre('');
    setDescripcion('');
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!isValidFolderName(nombre)) {
      setError('El nombre es obligatorio');
      nombreRef.current?.focus();
      return;
    }
    onCreate(nombre, descripcion);
    reset();
  }

  return (
    <section className="carpetas" aria-labelledby="carpetas-titulo">
      <form
        className="nueva-carpeta"
        onSubmit={handleSubmit}
        onReset={(e) => {
          e.preventDefault();
          reset();
          nombreRef.current?.focus();
        }}
        noValidate
        aria-labelledby="nueva-carpeta-titulo"
      >
        <h2 id="nueva-carpeta-titulo">Nueva carpeta</h2>
        <div className="campo">
          <label htmlFor="carpeta-nombre">Nombre</label>
          <input
            ref={nombreRef}
            id="carpeta-nombre"
            name="carpeta-nombre"
            type="text"
            autoComplete="off"
            value={nombre}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'carpeta-nombre-error' : undefined}
            onChange={(e) => {
              setNombre(e.target.value);
              if (error) setError('');
            }}
          />
          {error && (
            <p id="carpeta-nombre-error" className="error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="campo">
          <label htmlFor="carpeta-descripcion">
            Descripción <span className="opcional">(opcional)</span>
          </label>
          <input
            id="carpeta-descripcion"
            name="carpeta-descripcion"
            type="text"
            autoComplete="off"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div className="acciones">
          <button type="submit">Crear</button>
          <button type="reset" className="secundario">
            Limpiar
          </button>
        </div>
      </form>

      <div className="lista-carpetas">
        <h2 id="carpetas-titulo">Carpetas</h2>
        {folders.length === 0 ? (
          <p className="vacio">Aún no tienes carpetas.</p>
        ) : (
          <ul data-testid="folder-list">
            {folders.map((folder) => (
              <li key={folder.id} data-testid="folder-item">
                <div className="carpeta-texto">
                  <span data-testid="folder-name" className="carpeta-nombre">
                    {folder.nombre}
                  </span>
                  {folder.descripcion && <span className="carpeta-descripcion">{folder.descripcion}</span>}
                  <span className="carpeta-meta">
                    <span data-testid="folder-count">
                      {taskCountLabel(countTasksInFolder(tasks, folder.id))}
                    </span>
                    {folder.fecha_creacion && (
                      <>
                        {' · '}
                        <time dateTime={folder.fecha_creacion}>{formatDate(folder.fecha_creacion)}</time>
                      </>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
