import { test, expect } from '@playwright/test';

// US-02-4: eliminar una tarea.

async function crearTarea(page, titulo) {
  await page.getByLabel('Título', { exact: true }).fill(titulo);
  await page.locator('form.crear').getByRole('button', { name: 'Crear' }).click();
}

test('criterio 0: al confirmar la eliminación la tarea desaparece de inmediato', async ({ page }) => {
  await page.goto('/');
  await crearTarea(page, 'Comprar leche');
  await crearTarea(page, 'Pagar luz');

  const item = page.getByTestId('task-item').filter({ hasText: 'Comprar leche' });
  // El botón es solo un icono: sin texto visible, pero con nombre accesible.
  const deleteButton = item.getByRole('button', { name: 'Eliminar' });
  await expect(deleteButton).toHaveText('');
  await expect(deleteButton.locator('svg')).toBeVisible();
  await deleteButton.click();

  const dialog = page.getByRole('dialog', { name: '¿Eliminar la tarea?' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Esta acción no se puede deshacer.');

  // Cancelar no borra nada.
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('task-item')).toHaveCount(2);

  await item.getByRole('button', { name: 'Eliminar' }).click();
  await dialog.getByRole('button', { name: 'Eliminar' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('task-title')).toHaveText(['Pagar luz']);

  // Snackbar flotante con 'Tarea eliminada'; no queda el texto 'Eliminada' suelto en la página.
  const snackbar = page.getByTestId('snackbar');
  await expect(snackbar).toBeVisible();
  await expect(snackbar).toHaveText('Tarea eliminada');
  await expect(snackbar).toHaveCSS('position', 'fixed');
  await expect(page.getByText('Eliminada', { exact: true })).toHaveCount(0);
  await expect(snackbar).toBeHidden({ timeout: 6000 });
});

test('criterio 1: la tarea eliminada no vuelve al recargar', async ({ page }) => {
  await page.goto('/');
  await crearTarea(page, 'Comprar leche');
  await crearTarea(page, 'Pagar luz');

  // También se pueden eliminar tareas completadas.
  const item = page.getByTestId('task-item').filter({ hasText: 'Comprar leche' });
  await item.getByRole('checkbox', { name: /^Completada:/ }).check();
  await item.getByRole('button', { name: 'Eliminar' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByTestId('task-title')).toHaveText(['Pagar luz']);

  await page.reload();
  await expect(page.getByTestId('task-title')).toHaveText(['Pagar luz']);
  const stored = await page.evaluate(() => localStorage.getItem('prueba.tareas'));
  expect(stored).not.toContain('Comprar leche');
});
