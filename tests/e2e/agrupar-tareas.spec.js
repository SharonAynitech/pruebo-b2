import { test, expect } from '@playwright/test';

// US-03-1: agrupar por carpeta en Tabla y Tablero, y asignar tareas seleccionadas.

async function crearCarpeta(page, nombre) {
  const form = page.locator('form.nueva-carpeta');
  await form.getByLabel('Nombre').fill(nombre);
  await form.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByTestId('folder-name').filter({ hasText: nombre })).toHaveCount(1);
}

async function crearTarea(page, titulo, carpeta) {
  const form = page.locator('form.crear');
  await form.locator('input[name=titulo]').fill(titulo);
  await form.locator('select[name=carpeta]').selectOption({ label: carpeta ?? 'Sin carpeta' });
  await form.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByTestId('task-title').filter({ hasText: titulo })).toHaveCount(1);
}

const grupo = (page, nombre) => page.locator(`[data-testid=task-group][data-group="${nombre}"]`);
const columna = (page, nombre) => page.locator(`[data-testid=board-column][data-group="${nombre}"]`);

async function preparar(page) {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');
  await crearTarea(page, 'Informe', 'Trabajo');
  await crearTarea(page, 'Comprar leche');
}

test('US-03-1 criterio 0: en Tabla cada tarea aparece bajo su carpeta o "Sin carpeta"', async ({ page }) => {
  await preparar(page);
  await expect(page.getByTestId('view-table')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('group-title')).toHaveText(['Trabajo', 'Sin carpeta']);
  await expect(grupo(page, 'Trabajo').getByTestId('task-title')).toHaveText(['Informe']);
  await expect(grupo(page, 'Sin carpeta').getByTestId('task-title')).toHaveText(['Comprar leche']);
});

test('US-03-1 criterio 1: en Tablero cada tarea aparece en la columna de su carpeta', async ({ page }) => {
  await preparar(page);
  await page.getByTestId('view-board').click();
  await expect(page.getByTestId('view-board')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('column-title')).toHaveText(['Trabajo', 'Sin carpeta']);
  await expect(columna(page, 'Trabajo').getByTestId('card-title')).toHaveText(['Informe']);
  await expect(columna(page, 'Sin carpeta').getByTestId('card-title')).toHaveText(['Comprar leche']);
  await expect(page.getByTestId('task-group')).toHaveCount(0);
});

test('US-03-1 criterio 2: al cambiar de vista la tarea sigue en el mismo grupo', async ({ page }) => {
  await preparar(page);
  await expect(grupo(page, 'Trabajo').getByTestId('task-title')).toHaveText(['Informe']);
  await page.getByTestId('view-board').click();
  await expect(columna(page, 'Trabajo').getByTestId('card-title')).toHaveText(['Informe']);
  await page.getByTestId('view-table').click();
  await expect(grupo(page, 'Trabajo').getByTestId('task-title')).toHaveText(['Informe']);
});

test('US-03-1 criterio 3: tras recargar, la agrupación se mantiene en ambas vistas', async ({ page }) => {
  await preparar(page);
  await page.reload();
  await expect(grupo(page, 'Trabajo').getByTestId('task-title')).toHaveText(['Informe']);
  await expect(grupo(page, 'Sin carpeta').getByTestId('task-title')).toHaveText(['Comprar leche']);
  await page.getByTestId('view-board').click();
  await expect(columna(page, 'Trabajo').getByTestId('card-title')).toHaveText(['Informe']);
  await expect(columna(page, 'Sin carpeta').getByTestId('card-title')).toHaveText(['Comprar leche']);
});

test('US-03-1 criterio 4: sin selección no se ofrece "Asignar a carpeta"', async ({ page }) => {
  await preparar(page);
  await expect(page.getByTestId('task-select')).toHaveCount(2);
  await expect(page.getByTestId('selection-bar')).toHaveCount(0);
  await expect(page.getByLabel('Asignar a carpeta')).toHaveCount(0);
});

test('US-03-1 criterio 5: con una tarea seleccionada se puede asignar a una carpeta', async ({ page }) => {
  await preparar(page);
  await grupo(page, 'Sin carpeta').getByTestId('task-select').check();
  const barra = page.getByTestId('selection-bar');
  await expect(barra).toBeVisible();
  await expect(barra.getByTestId('selection-count')).toHaveText('1 seleccionada');
  // Elegir la carpeta no asigna nada: hace falta pulsar Asignar.
  await barra.getByLabel('Asignar a carpeta').selectOption({ label: 'Trabajo' });
  await expect(grupo(page, 'Sin carpeta').getByTestId('task-title')).toHaveText(['Comprar leche']);
  await barra.getByTestId('assign-folder').click();
  await expect(grupo(page, 'Trabajo').getByTestId('task-title')).toHaveText(['Comprar leche', 'Informe']);
  await expect(grupo(page, 'Sin carpeta').getByTestId('task-title')).toHaveCount(0);
  await expect(page.getByTestId('snackbar')).toHaveText('Tarea asignada');
  await expect(barra).toHaveCount(0);
  await page.reload();
  await expect(grupo(page, 'Trabajo').getByTestId('task-title')).toHaveText(['Comprar leche', 'Informe']);
});

test('US-03-1 criterio 6: con varias seleccionadas se asignan todas', async ({ page }) => {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');
  await crearCarpeta(page, 'Casa');
  await crearTarea(page, 'Informe', 'Trabajo');
  await crearTarea(page, 'Comprar leche');
  await crearTarea(page, 'Pagar luz');
  await grupo(page, 'Sin carpeta').getByTestId('task-select').nth(0).check();
  await grupo(page, 'Sin carpeta').getByTestId('task-select').nth(1).check();
  await grupo(page, 'Trabajo').getByTestId('task-select').check();
  const barra = page.getByTestId('selection-bar');
  await expect(barra.getByTestId('selection-count')).toHaveText('3 seleccionadas');
  await barra.getByLabel('Asignar a carpeta').selectOption({ label: 'Casa' });
  await barra.getByTestId('assign-folder').click();
  await expect(grupo(page, 'Casa').getByTestId('task-title')).toHaveText(['Pagar luz', 'Comprar leche', 'Informe']);
  await expect(grupo(page, 'Trabajo').getByTestId('task-title')).toHaveCount(0);
  await expect(grupo(page, 'Sin carpeta').getByTestId('task-title')).toHaveCount(0);
  await expect(page.getByTestId('snackbar')).toHaveText('3 tareas asignadas');
  await page.reload();
  await expect(grupo(page, 'Casa').getByTestId('task-title')).toHaveCount(3);
});

test('US-03-1 criterio 7: la asignación solo existe en la barra de selección', async ({ page }) => {
  await preparar(page);
  await expect(page.getByTestId('assign-folder')).toHaveCount(0);
  await page.getByTestId('task-select').first().check();
  const barra = page.getByTestId('selection-bar');
  await expect(barra.getByTestId('assign-folder')).toBeVisible();
  // Sin elegir carpeta, Asignar está deshabilitado.
  await expect(barra.getByTestId('assign-folder')).toBeDisabled();
  await expect(page.getByTestId('assign-folder')).toHaveCount(1);
  await barra.getByRole('button', { name: 'Deseleccionar' }).click();
  await expect(page.getByTestId('assign-folder')).toHaveCount(0);
  await expect(page.getByTestId('task-select').first()).not.toBeChecked();
});
