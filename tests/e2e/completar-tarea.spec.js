import { test, expect } from '@playwright/test';

// US-02-3: marcar una tarea como completada.

async function crearTarea(page, titulo) {
  await page.getByLabel('Título', { exact: true }).fill(titulo);
  await page.locator('form.crear').getByRole('button', { name: 'Crear' }).click();
}

test('criterio 0: al marcarla, la tarea se ve tachada; al desmarcarla vuelve a pendiente', async ({ page }) => {
  await page.goto('/');
  await crearTarea(page, 'Comprar leche');

  const item = page.getByTestId('task-item');
  const title = item.getByTestId('task-title');
  const checkbox = item.getByRole('checkbox', { name: 'Completada: Comprar leche' });

  await expect(checkbox).not.toBeChecked();
  await expect(title).not.toHaveCSS('text-decoration-line', 'line-through');

  await checkbox.check();
  await expect(checkbox).toBeChecked();
  await expect(item).toHaveAttribute('data-completed', 'true');
  await expect(title).toHaveCSS('text-decoration-line', 'line-through');
  await expect(title).toHaveCSS('color', 'rgb(153, 153, 153)');

  await checkbox.uncheck();
  await expect(item).toHaveAttribute('data-completed', 'false');
  await expect(title).not.toHaveCSS('text-decoration-line', 'line-through');
});

test('criterio 1: la tarea completada sigue completada al recargar', async ({ page }) => {
  await page.goto('/');
  await crearTarea(page, 'Comprar leche');
  await crearTarea(page, 'Pagar luz');

  await page
    .getByTestId('task-item')
    .filter({ hasText: 'Comprar leche' })
    .getByRole('checkbox', { name: /^Completada:/ })
    .check();

  await page.reload();

  const done = page.getByTestId('task-item').filter({ hasText: 'Comprar leche' });
  const pending = page.getByTestId('task-item').filter({ hasText: 'Pagar luz' });
  await expect(done.getByRole('checkbox', { name: /^Completada:/ })).toBeChecked();
  await expect(done.getByTestId('task-title')).toHaveCSS('text-decoration-line', 'line-through');
  await expect(pending.getByRole('checkbox', { name: /^Completada:/ })).not.toBeChecked();
});
