import { test, expect } from '@playwright/test';

// US-02-3: eliminar una carpeta (y sus tareas).

async function crearCarpeta(page, nombre) {
  const form = page.locator('form.nueva-carpeta');
  await form.getByLabel('Nombre').fill(nombre);
  await form.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByTestId('folder-name')).toContainText([nombre]);
}

async function crearTarea(page, titulo, carpeta) {
  const form = page.locator('form.crear');
  await form.locator('input[name=titulo]').fill(titulo);
  await form.locator('select[name=carpeta]').selectOption({ label: carpeta ?? 'Sin carpeta' });
  await form.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByTestId('task-title').filter({ hasText: titulo })).toHaveCount(1);
}

function carpeta(page, nombre) {
  return page.getByTestId('folder-item').filter({ has: page.getByText(nombre, { exact: true }) });
}

test('US-02-3 criterio 0: una carpeta sin tareas se elimina tras confirmar', async ({ page }) => {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');
  await crearCarpeta(page, 'Casa');

  await carpeta(page, 'Trabajo').getByTestId('folder-delete').click();
  const dialog = page.getByTestId('delete-folder-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading')).toHaveText('¿Eliminar la carpeta?');
  await expect(dialog).toContainText('Esta acción no se puede deshacer.');

  // Cancelar no borra nada.
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('folder-name')).toHaveText(['Trabajo', 'Casa']);

  await carpeta(page, 'Trabajo').getByTestId('folder-delete').click();
  await dialog.getByTestId('confirm-delete-folder').click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('folder-name')).toHaveText(['Casa']);
  await expect(page.getByTestId('snackbar')).toHaveText('Carpeta eliminada');

  await page.reload();
  await expect(page.getByTestId('folder-name')).toHaveText(['Casa']);
});

test('US-02-3 criterio 1: con tareas, el diálogo muestra cuántas se borran y elimina carpeta y tareas', async ({ page }) => {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');
  await crearCarpeta(page, 'Casa');
  await crearTarea(page, 'Informe', 'Trabajo');
  await crearTarea(page, 'Reunión', 'Trabajo');
  await crearTarea(page, 'Regar plantas', 'Casa');
  await crearTarea(page, 'Comprar leche');
  await expect(carpeta(page, 'Trabajo').getByTestId('folder-count')).toHaveText('2 tareas');

  await carpeta(page, 'Trabajo').getByTestId('folder-delete').click();
  const dialog = page.getByTestId('delete-folder-dialog');
  await expect(dialog.getByTestId('delete-folder-count')).toHaveText(
    'También se eliminarán 2 tareas de esta carpeta.',
  );
  await dialog.getByTestId('confirm-delete-folder').click();

  await expect(page.getByTestId('folder-name')).toHaveText(['Casa']);
  // Desde US-03-1 la lista se agrupa: primero Casa, luego "Sin carpeta".
  await expect(page.getByTestId('task-title')).toHaveText(['Regar plantas', 'Comprar leche']);

  const stored = await page.evaluate(() => ({
    carpetas: JSON.parse(localStorage.getItem('prueba.carpetas')).map((c) => c.nombre),
    tareas: JSON.parse(localStorage.getItem('prueba.tareas')).map((t) => t.titulo),
  }));
  expect(stored).toEqual({ carpetas: ['Casa'], tareas: ['Comprar leche', 'Regar plantas'] });

  await page.reload();
  await expect(page.getByTestId('folder-name')).toHaveText(['Casa']);
  await expect(page.getByTestId('task-title')).toHaveText(['Regar plantas', 'Comprar leche']);
});

test('US-02-3: con una sola tarea el texto usa singular', async ({ page }) => {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');
  await crearTarea(page, 'Informe', 'Trabajo');
  await page.getByTestId('folder-delete').click();
  await expect(page.getByTestId('delete-folder-count')).toHaveText(
    'También se eliminará 1 tarea de esta carpeta.',
  );
});

test('US-02-3: el selector de carpeta vuelve a "Sin carpeta" si se elimina la elegida', async ({ page }) => {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');
  const select = page.locator('form.crear select[name=carpeta]');
  await select.selectOption({ label: 'Trabajo' });
  await page.getByTestId('folder-delete').click();
  await page.getByTestId('confirm-delete-folder').click();
  await expect(select.locator('option')).toHaveText(['Sin carpeta']);
  await expect(select).toHaveValue('');
});
