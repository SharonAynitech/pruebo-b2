import { formatDate } from './tasks.js';

// Vista Tablero: una columna por carpeta y "Sin carpeta" al final.
export default function TaskBoard({ groups }) {
  return (
    <div className="tablero">
      {groups.map((group) => {
        const headingId = `columna-${group.id ?? 'sin-carpeta'}`;
        return (
          <section
            key={group.id ?? 'sin-carpeta'}
            className="columna"
            data-testid="board-column"
            data-group={group.nombre}
            aria-labelledby={headingId}
          >
            <header className="grupo-cabecera">
              <h3 id={headingId} data-testid="column-title">
                {group.nombre}
              </h3>
              <span className="grupo-conteo">{group.tasks.length}</span>
            </header>
            {group.tasks.length === 0 ? (
              <p className="vacio">Sin tareas</p>
            ) : (
              <ul>
                {group.tasks.map((task) => (
                  <li
                    key={task.id}
                    className={task.completada ? 'tarjeta completada' : 'tarjeta'}
                    data-testid="board-card"
                  >
                    <span className="titulo" data-testid="card-title">
                      {task.titulo}
                    </span>
                    <time dateTime={task.fecha_creacion}>{formatDate(task.fecha_creacion)}</time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
