import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createTask,
  deleteTask,
  isValidTitle,
  loadTasks,
  saveTasks,
  toggleTaskCompleted,
  updateTaskTitle,
} from '../../src/tasks.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
  };
}

test('isValidTitle rechaza vacío y solo espacios', () => {
  assert.equal(isValidTitle(''), false);
  assert.equal(isValidTitle('   '), false);
  assert.equal(isValidTitle('\t\n'), false);
  assert.equal(isValidTitle('Comprar leche'), true);
});

test('createTask recorta el título, registra la fecha y empieza pendiente', () => {
  const now = new Date('2026-11-02T10:00:00Z');
  const task = createTask('  Comprar leche  ', now);
  assert.equal(task.titulo, 'Comprar leche');
  assert.equal(task.fecha_creacion, '2026-11-02T10:00:00.000Z');
  assert.equal(task.completada, false);
  assert.ok(task.id);
});

test('createTask guarda la carpeta elegida o null si no hay', () => {
  assert.equal(createTask('Uno').carpeta_id, null);
  assert.equal(createTask('Dos', new Date(), 'c1').carpeta_id, 'c1');
  assert.equal(createTask('Tres', new Date(), '').carpeta_id, null);
});

test('createTask lanza con título inválido', () => {
  assert.throws(() => createTask('   '));
});

test('saveTasks y loadTasks hacen ida y vuelta', () => {
  const storage = memoryStorage();
  const tasks = [createTask('Uno'), createTask('Dos')];
  saveTasks(tasks, storage);
  assert.deepEqual(loadTasks(storage), tasks);
});

test('loadTasks devuelve lista vacía con datos ausentes o corruptos', () => {
  const storage = memoryStorage();
  assert.deepEqual(loadTasks(storage), []);
  storage.setItem('prueba.tareas', '{no es json');
  assert.deepEqual(loadTasks(storage), []);
});

test('updateTaskTitle cambia solo el título de la tarea indicada', () => {
  const [a, b] = [createTask('Uno'), createTask('Dos')];
  const next = updateTaskTitle([a, b], b.id, '  Tres  ');
  assert.deepEqual(next, [a, { ...b, titulo: 'Tres' }]);
  assert.equal(b.titulo, 'Dos');
});

test('updateTaskTitle lanza con título vacío y no modifica nada', () => {
  const tasks = [createTask('Uno')];
  assert.throws(() => updateTaskTitle(tasks, tasks[0].id, '   '));
  assert.equal(tasks[0].titulo, 'Uno');
});

test('toggleTaskCompleted alterna solo la tarea indicada', () => {
  const [a, b] = [createTask('Uno'), createTask('Dos')];
  const once = toggleTaskCompleted([a, b], a.id);
  assert.deepEqual(once, [{ ...a, completada: true }, b]);
  assert.equal(a.completada, false);
  const twice = toggleTaskCompleted(once, a.id);
  assert.deepEqual(twice, [a, b]);
});

test('deleteTask quita solo la tarea indicada', () => {
  const [a, b] = [createTask('Uno'), createTask('Dos')];
  const tasks = [a, b];
  assert.deepEqual(deleteTask(tasks, a.id), [b]);
  assert.deepEqual(tasks, [a, b]);
});
