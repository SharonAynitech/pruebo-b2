import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FOLDERS_STORAGE_KEY,
  countTasksInFolder,
  createFolder,
  deleteFolder,
  isValidFolderName,
  loadFolders,
  renameFolder,
  saveFolders,
} from '../../src/folders.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
  };
}

test('la clave de almacenamiento de carpetas es prueba.carpetas', () => {
  assert.equal(FOLDERS_STORAGE_KEY, 'prueba.carpetas');
});

test('isValidFolderName rechaza vacío y solo espacios', () => {
  assert.equal(isValidFolderName(''), false);
  assert.equal(isValidFolderName('   '), false);
  assert.equal(isValidFolderName('\t\n'), false);
  assert.equal(isValidFolderName(undefined), false);
  assert.equal(isValidFolderName('Trabajo'), true);
});

test('createFolder recorta nombre y descripción, asigna id y fecha', () => {
  const now = new Date('2026-11-09T10:00:00Z');
  const folder = createFolder('  Trabajo  ', '  Pendientes de la oficina  ', now);
  assert.equal(folder.nombre, 'Trabajo');
  assert.equal(folder.descripcion, 'Pendientes de la oficina');
  assert.equal(folder.fecha_creacion, '2026-11-09T10:00:00.000Z');
  assert.ok(folder.id);
});

test('createFolder acepta descripción ausente', () => {
  assert.equal(createFolder('Casa').descripcion, '');
});

test('createFolder lanza con nombre inválido', () => {
  assert.throws(() => createFolder('   '), /El nombre es obligatorio/);
});

test('saveFolders y loadFolders hacen ida y vuelta', () => {
  const storage = memoryStorage();
  const folders = [createFolder('Uno'), createFolder('Dos')];
  saveFolders(folders, storage);
  assert.deepEqual(loadFolders(storage), folders);
});

test('loadFolders devuelve lista vacía con datos ausentes, corruptos o no-array', () => {
  const storage = memoryStorage();
  assert.deepEqual(loadFolders(storage), []);
  storage.setItem(FOLDERS_STORAGE_KEY, '{no es json');
  assert.deepEqual(loadFolders(storage), []);
  storage.setItem(FOLDERS_STORAGE_KEY, '{"a":1}');
  assert.deepEqual(loadFolders(storage), []);
});

test('renameFolder cambia solo el nombre (recortado) de la carpeta indicada', () => {
  const a = createFolder('Trabajo', 'Oficina');
  const b = createFolder('Casa');
  const next = renameFolder([a, b], a.id, '  Oficina  ');
  assert.equal(next[0].nombre, 'Oficina');
  assert.equal(next[0].id, a.id);
  assert.equal(next[0].descripcion, 'Oficina');
  assert.equal(next[0].fecha_creacion, a.fecha_creacion);
  assert.deepEqual(next[1], b);
  assert.equal(a.nombre, 'Trabajo', 'no muta la lista original');
});

test('renameFolder lanza con nombre vacío o solo espacios', () => {
  const a = createFolder('Trabajo');
  assert.throws(() => renameFolder([a], a.id, ''), /El nombre es obligatorio/);
  assert.throws(() => renameFolder([a], a.id, '   '), /El nombre es obligatorio/);
});

test('deleteFolder quita la carpeta y solo sus tareas, sin mutar', () => {
  const a = createFolder('Trabajo');
  const b = createFolder('Casa');
  const tasks = [
    { id: 't1', carpeta_id: a.id },
    { id: 't2', carpeta_id: null },
    { id: 't3', carpeta_id: b.id },
    { id: 't4', carpeta_id: a.id },
    { id: 't5' },
  ];
  const next = deleteFolder([a, b], tasks, a.id);
  assert.deepEqual(next.folders, [b]);
  assert.deepEqual(next.tasks.map((t) => t.id), ['t2', 't3', 't5']);
  assert.equal(tasks.length, 5);
});

test('deleteFolder sin tareas solo quita la carpeta', () => {
  const a = createFolder('Trabajo');
  const tasks = [{ id: 't1', carpeta_id: null }];
  const next = deleteFolder([a], tasks, a.id);
  assert.deepEqual(next.folders, []);
  assert.deepEqual(next.tasks, tasks);
});

test('countTasksInFolder cuenta solo las tareas de esa carpeta', () => {
  const tasks = [{ carpeta_id: 'a' }, { carpeta_id: 'b' }, { carpeta_id: 'a' }, {}];
  assert.equal(countTasksInFolder(tasks, 'a'), 2);
  assert.equal(countTasksInFolder(tasks, 'c'), 0);
});
