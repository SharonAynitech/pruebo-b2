import { test, expect } from '@playwright/test';

// US-03-2: elegir carpeta en el formulario de creación de tareas.

async function crearCarpeta(page, nombre) {
  const form = page.locator('form.nueva-carpeta');
  await form.getByLabel('Nombre').fill(nombre);
  await form.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByTestId('folder-name').filter({ hasText: nombre })).toHaveCount(1);
}

const grupo = (page, nombre) => page.locator(`[data-testid=task-group][data-group="${nombre}"]`);

test('US-03-2: el selector de carpeta tiene etiqueta, valor por defecto y ayuda', async ({ page }) => {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');
  const select = page.locator('form.crear').getByLabel(/^Carpeta/);
  await expect(select).toHaveValue('');
  await expect(select.locator('option:checked')).toHaveText('Sin carpeta');
  await expect(select).toHaveAccessibleDescription(
    'La tarea quedará en la carpeta que elijas. Déjalo en «Sin carpeta» para crearla sin agrupar.',
  );
});

test('US-03-2 criterio 0: con una carpeta elegida, la tarea nueva aparece en su sección', async ({ page }) => {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');
  await crearCarpeta(page, 'Casa');
  const form = page.locator('form.crear');
  await form.locator('input[name=titulo]').fill('Informe');
  await form.getByLabel(/^Carpeta/).selectOption({ label: 'Trabajo' });
  await form.getByRole('button', { name: 'Crear' }).click();

  await expect(grupo(page, 'Trabajo').getByTestId('task-title')).toHaveText(['Informe']);
  await expect(grupo(page, 'Sin carpeta').getByTestId('task-item')).toHaveCount(0);
  await expect(page.getByTestId('folder-item').filter({ hasText: 'Trabajo' }).getByTestId('folder-count')).toHaveText('1 tarea');
  // La carpeta elegida se mantiene para crear varias seguidas.
  await expect(form.getByLabel(/^Carpeta/)).toHaveValue(/.+/);

  await page.getByTestId('view-board').click();
  await expect(page.locator('[data-testid=board-column][data-group="Trabajo"] [data-testid=card-title]')).toHaveText(['Informe']);

  await page.reload();
  await expect(grupo(page, 'Trabajo').getByTestId('task-title')).toHaveText(['Informe']);
});

test('US-03-2 criterio 1: dejando el selector por defecto, la tarea aparece en "Sin carpeta"', async ({ page }) => {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');
  const form = page.locator('form.crear');
  await form.locator('input[name=titulo]').fill('Comprar leche');
  await form.getByRole('button', { name: 'Crear' }).click();

  await expect(grupo(page, 'Sin carpeta').getByTestId('task-title')).toHaveText(['Comprar leche']);
  await expect(grupo(page, 'Trabajo').getByTestId('task-item')).toHaveCount(0);

  await page.reload();
  await expect(grupo(page, 'Sin carpeta').getByTestId('task-title')).toHaveText(['Comprar leche']);
});
