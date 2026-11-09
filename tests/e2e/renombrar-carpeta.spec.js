import { test, expect } from '@playwright/test';

// US-02-2: renombrar una carpeta existente.

async function crearCarpeta(page, nombre) {
  const form = page.locator('form.nueva-carpeta');
  await form.getByLabel('Nombre').fill(nombre);
  await form.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByTestId('folder-name')).toContainText([nombre]);
}

test('US-02-2 criterio 0: el nuevo nombre aparece en la lista y persiste al recargar', async ({ page }) => {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');
  await crearCarpeta(page, 'Casa');

  const trabajo = page.getByTestId('folder-item').filter({ hasText: 'Trabajo' });
  await trabajo.getByTestId('folder-rename').click();
  const input = page.locator('input[name=carpeta-renombrar]');
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Trabajo');
  await input.fill('  Oficina  ');
  await page.getByTestId('folder-save').click();

  await expect(page.getByTestId('folder-name')).toHaveText(['Oficina', 'Casa']);
  await expect(page.getByTestId('snackbar')).toHaveText('Carpeta renombrada');

  await page.reload();
  await expect(page.getByTestId('folder-name')).toHaveText(['Oficina', 'Casa']);
});

test('US-02-2 criterio 1: nombre vacío muestra error y conserva el nombre original', async ({ page }) => {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');

  await page.getByTestId('folder-rename').click();
  const input = page.locator('input[name=carpeta-renombrar]');
  await input.fill('   ');
  await page.getByTestId('folder-save').click();

  const item = page.getByTestId('folder-item');
  await expect(item.getByRole('alert')).toHaveText('El nombre es obligatorio');
  await expect(input).toHaveAttribute('aria-invalid', 'true');

  await item.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByTestId('folder-name')).toHaveText(['Trabajo']);

  await page.reload();
  await expect(page.getByTestId('folder-name')).toHaveText(['Trabajo']);
});

test('US-02-2: Escape cancela la edición sin cambios', async ({ page }) => {
  await page.goto('/');
  await crearCarpeta(page, 'Trabajo');
  await page.getByTestId('folder-rename').click();
  const input = page.locator('input[name=carpeta-renombrar]');
  await input.fill('Otro');
  await input.press('Escape');
  await expect(page.getByTestId('folder-name')).toHaveText(['Trabajo']);
  await expect(page.getByTestId('folder-rename')).toBeFocused();
});
