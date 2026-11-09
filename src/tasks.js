// Modelo y persistencia local de tareas (localStorage, escritura síncrona).

export const STORAGE_KEY = 'prueba.tareas';

export function isValidTitle(titulo) {
  return typeof titulo === 'string' && titulo.trim().length > 0;
}

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createTask(titulo, now = new Date(), carpetaId = null) {
  if (!isValidTitle(titulo)) throw new Error('El título es obligatorio');
  return {
    id: newId(),
    titulo: titulo.trim(),
    fecha_creacion: now.toISOString(),
    completada: false,
    carpeta_id: carpetaId || null,
  };
}

export function updateTaskTitle(tasks, id, titulo) {
  if (!isValidTitle(titulo)) throw new Error('El título es obligatorio');
  return tasks.map((task) => (task.id === id ? { ...task, titulo: titulo.trim() } : task));
}

export function toggleTaskCompleted(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, completada: !task.completada } : task));
}

export const SIN_CARPETA = 'Sin carpeta';

// Un grupo por carpeta (en su orden, aunque esté vacía) y "Sin carpeta" al final.
// Las tareas cuya carpeta ya no existe caen en "Sin carpeta".
export function groupTasksByFolder(tasks, folders) {
  const groups = folders.map((folder) => ({ id: folder.id, nombre: folder.nombre, tasks: [] }));
  const byId = new Map(groups.map((group) => [group.id, group]));
  const sinCarpeta = { id: null, nombre: SIN_CARPETA, tasks: [] };
  for (const task of tasks) {
    (byId.get(task.carpeta_id) ?? sinCarpeta).tasks.push(task);
  }
  return [...groups, sinCarpeta];
}

export function assignTasksToFolder(tasks, ids, carpetaId) {
  const selected = new Set(ids);
  return tasks.map((task) =>
    selected.has(task.id) ? { ...task, carpeta_id: carpetaId || null } : task,
  );
}

export function deleteTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

export function loadTasks(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks, storage = globalThis.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

const dateFormat = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

export function formatDate(iso) {
  return dateFormat.format(new Date(iso));
}
