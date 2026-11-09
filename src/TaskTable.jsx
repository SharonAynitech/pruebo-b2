import TaskItem from './TaskItem.jsx';

function countLabel(n) {
  return n === 1 ? '1 tarea' : `${n} tareas`;
}

// Vista Tabla: una sección por carpeta y "Sin carpeta" al final; cada tarea se puede seleccionar.
export default function TaskTable({ groups, selected, onSelect, onRename, onToggle, onDelete }) {
  return (
    <div className="grupos">
      {groups.map((group) => {
        const headingId = `grupo-${group.id ?? 'sin-carpeta'}`;
        return (
          <section
            key={group.id ?? 'sin-carpeta'}
            className="grupo"
            data-testid="task-group"
            data-group={group.nombre}
            aria-labelledby={headingId}
          >
            <header className="grupo-cabecera">
              <h3 id={headingId} data-testid="group-title">
                {group.nombre}
              </h3>
              <span className="grupo-conteo">{countLabel(group.tasks.length)}</span>
            </header>
            {group.tasks.length === 0 ? (
              <p className="vacio">Sin tareas</p>
            ) : (
              <ul>
                {group.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    selected={selected.has(task.id)}
                    onSelect={onSelect}
                    onRename={onRename}
                    onToggle={onToggle}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
