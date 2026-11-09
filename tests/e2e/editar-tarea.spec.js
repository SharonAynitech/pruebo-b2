import { test, expect } from '@playwright/test';

// US-02-2: editar el título de una tarea.

async function crearTarea(page, titulo) {
  await page.getByLabel('Título', { exact: true }).fill(titulo);
  await page.locator('form.crear').getByRole('button', { name: 'Crear' }).click();
}

test('criterio 0: el título editado se muestra y persiste al recargar', async ({ page }) => {
  await page.goto('/');
  await crearTarea(page, 'Comprar leche');

  const item = page.getByTestId('task-item');
  await expect(item).toHaveCount(1);
  await item.getByRole('button', { name: 'Editar' }).click();
  await expect(item.getByLabel('Editar título')).toHaveValue('Comprar leche');
  await item.getByLabel('Editar título').fill('Comprar pan');
  await item.getByRole('button', { name: 'Guardar' }).click();

  await expect(page.getByTestId('task-title')).toHaveText(['Comprar pan']);
  await expect(page.getByLabel('Editar título')).toHaveCount(0);

  await page.reload();
  await expect(page.getByTestId('task-title')).toHaveText(['Comprar pan']);
});

test('criterio 1: un título vacío bloquea la edición y se conserva el anterior', async ({ page }) => {
  await page.goto('/');
  await crearTarea(page, 'Comprar leche');

  const item = page.getByTestId('task-item');
  await item.getByRole('button', { name: 'Editar' }).click();
  await item.getByLabel('Editar título').fill('   ');
  await item.getByRole('button', { name: 'Guardar' }).click();

  await expect(item.getByRole('alert')).toHaveText('El título es obligatorio');
  await expect(item.getByLabel('Editar título')).toBeVisible();

  await item.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByTestId('task-title')).toHaveText(['Comprar leche']);

  await page.reload();
  await expect(page.getByTestId('task-title')).toHaveText(['Comprar leche']);
});
