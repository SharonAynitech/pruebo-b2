import { test, expect } from '@playwright/test';

// US-02-1: crear una tarea con título.

test('criterio 0: una tarea con título aparece con su fecha y persiste al recargar', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Título').fill('Comprar leche');
  await page.locator('form.crear').getByRole('button', { name: 'Crear' }).click();

  const item = page.getByTestId('task-item').filter({ hasText: 'Comprar leche' });
  await expect(item).toHaveCount(1);
  await expect(item.getByTestId('task-date')).toBeVisible();
  await expect(item.getByTestId('task-date')).not.toBeEmpty();

  await page.reload();
  const reloaded = page.getByTestId('task-item').filter({ hasText: 'Comprar leche' });
  await expect(reloaded).toHaveCount(1);
  await expect(reloaded.getByTestId('task-date')).toBeVisible();
});

test('criterio 1: un título vacío o solo con espacios se rechaza', async ({ page }) => {
  await page.goto('/');
  const title = page.getByLabel('Título');

  await page.locator('form.crear').getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByRole('alert')).toHaveText('El título es obligatorio');
  await expect(page.getByTestId('task-item')).toHaveCount(0);
  await expect(title).toBeVisible();

  await title.fill('   ');
  await page.locator('form.crear').getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByRole('alert')).toHaveText('El título es obligatorio');
  await expect(page.getByTestId('task-item')).toHaveCount(0);
  await expect(title).toBeVisible();

  await page.reload();
  await expect(page.getByTestId('task-item')).toHaveCount(0);
});
