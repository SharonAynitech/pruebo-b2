// Modelo y persistencia local de carpetas (localStorage, clave propia).

export const FOLDERS_STORAGE_KEY = 'prueba.carpetas';

export function isValidFolderName(nombre) {
  return typeof nombre === 'string' && nombre.trim().length > 0;
}

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createFolder(nombre, descripcion = '', now = new Date()) {
  if (!isValidFolderName(nombre)) throw new Error('El nombre es obligatorio');
  return {
    id: newId(),
    nombre: nombre.trim(),
    descripcion: typeof descripcion === 'string' ? descripcion.trim() : '',
    fecha_creacion: now.toISOString(),
  };
}

export function renameFolder(folders, id, nombre) {
  if (!isValidFolderName(nombre)) throw new Error('El nombre es obligatorio');
  return folders.map((folder) => (folder.id === id ? { ...folder, nombre: nombre.trim() } : folder));
}

// Borra la carpeta y, en cascada, las tareas que pertenecen a ella.
export function deleteFolder(folders, tasks, id) {
  return {
    folders: folders.filter((folder) => folder.id !== id),
    tasks: tasks.filter((task) => task.carpeta_id !== id),
  };
}

export function countTasksInFolder(tasks, carpetaId) {
  return tasks.filter((task) => task.carpeta_id === carpetaId).length;
}

export function loadFolders(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(FOLDERS_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFolders(folders, storage = globalThis.localStorage) {
  storage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
}
