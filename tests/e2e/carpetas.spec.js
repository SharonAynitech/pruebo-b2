import { test, expect } from '@playwright/test';

// US-02-1: crear una carpeta con nombre.

function folderForm(page) {
  return page.locator('form.nueva-carpeta');
}

test('US-02-1 criterio 0: la carpeta creada aparece en la lista con su nombre', async ({ page }) => {
  await page.goto('/');
  const form = folderForm(page);
  await form.getByLabel('Nombre').fill('  Trabajo  ');
  await form.getByLabel(/Descripción/).fill('Pendientes de la oficina');
  await form.getByRole('button', { name: 'Crear' }).click();

  const items = page.getByTestId('folder-item');
  await expect(items).toHaveCount(1);
  await expect(items.getByTestId('folder-name')).toHaveText('Trabajo');
  await expect(items).toContainText('Pendientes de la oficina');
  await expect(items.getByTestId('folder-count')).toHaveText('0 tareas');
  await expect(page.getByTestId('snackbar')).toHaveText('Carpeta creada');
  await expect(form.getByLabel('Nombre')).toHaveValue('');

  await page.reload();
  await expect(page.getByTestId('folder-name')).toHaveText(['Trabajo']);
});

test('US-02-1 criterio 1: nombre vacío o con solo espacios muestra error y no crea carpeta', async ({ page }) => {
  await page.goto('/');
  const form = folderForm(page);

  await form.getByRole('button', { name: 'Crear' }).click();
  await expect(form.getByRole('alert')).toHaveText('El nombre es obligatorio');
  await expect(form.getByLabel('Nombre')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByTestId('folder-item')).toHaveCount(0);

  await form.getByLabel('Nombre').fill('   ');
  await form.getByRole('button', { name: 'Crear' }).click();
  await expect(form.getByRole('alert')).toHaveText('El nombre es obligatorio');
  await expect(page.getByTestId('folder-item')).toHaveCount(0);

  await page.reload();
  await expect(page.getByTestId('folder-item')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('prueba.carpetas'))).toBeNull();
});

test('US-02-1: Limpiar vacía el formulario y el error', async ({ page }) => {
  await page.goto('/');
  const form = folderForm(page);
  await form.getByRole('button', { name: 'Crear' }).click();
  await expect(form.getByRole('alert')).toBeVisible();
  await form.getByLabel('Nombre').fill('Casa');
  await form.getByRole('button', { name: 'Limpiar' }).click();
  await expect(form.getByLabel('Nombre')).toHaveValue('');
  await expect(form.getByRole('alert')).toHaveCount(0);
});
