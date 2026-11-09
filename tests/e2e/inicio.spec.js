import { test, expect } from '@playwright/test';

// US-01-1: la aplicación levanta con un solo comando y muestra el nombre del proyecto.

test('GET /health responde 200 con {"status":"ok"}', async ({ request }) => {
  const res = await request.get('/health');
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ status: 'ok' });
});

test('criterio 0: al abrir la URL se ve el nombre del proyecto', async ({ page }) => {
  const res = await page.goto('/');
  expect(res.status()).toBe(200);
  await expect(page).toHaveTitle('prueba');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('prueba');
});

test('criterio 1: crear y editar una tarea persiste el título actualizado tras recargar', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Título', { exact: true }).fill('Comprar leche');
  await page.getByRole('button', { name: 'Crear' }).click();

  const item = page.getByTestId('task-item');
  await expect(item).toHaveCount(1);
  await item.getByRole('button', { name: 'Editar' }).click();
  await item.getByLabel('Editar título').fill('Comprar pan');
  await item.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByTestId('task-title')).toHaveText(['Comprar pan']);

  await page.reload();
  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByTestId('task-title')).toHaveText(['Comprar pan']);
});

test('regresión: en una pestaña nueva carga la misma página sin login', async ({ context }) => {
  const first = await context.newPage();
  await first.goto('/');
  await expect(first.getByRole('heading', { level: 1 })).toHaveText('prueba');

  const second = await context.newPage();
  await second.goto('/');
  await expect(second.getByRole('heading', { level: 1 })).toHaveText('prueba');
  await expect(second.locator('input[type=password]')).toHaveCount(0);
});
