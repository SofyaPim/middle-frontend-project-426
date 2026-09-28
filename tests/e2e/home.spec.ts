import { expect, test } from '@playwright/test';

async function blockExternal(page: import('@playwright/test').Page) {
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
  await page.route('https://fonts.gstatic.com/**', (r) => r.abort());
  await page.route('https://picsum.photos/**', (r) => r.abort());
}

test('главная открывается на / и показывает промо-блоки', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('home-promo')).toBeVisible();
  const items = page.getByTestId('home-promo-item');
  expect(await items.count()).toBeGreaterThan(1);
  await expect(items.filter({ hasText: 'RTX 5070' }).first()).toBeVisible();
  await expect(items.filter({ hasText: 'CoreForge 7' }).first()).toBeVisible();
});

test('клик по промо-блоку открывает страницу его товара', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/');
  const item = page.getByTestId('home-promo-item').first();
  const href = await item.getAttribute('href');
  expect(href).toMatch(/^\/products\/[\w-]+$/);
  await Promise.all([
    page.waitForURL(`**${href}`),
    item.click(),
  ]);
});

test('из главной каталог открывается по ссылке в шапке', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/');
  await expect(page.getByTestId('nav-catalog')).toBeVisible();
  await Promise.all([
    page.waitForURL('**/catalog'),
    page.getByTestId('nav-catalog').click(),
  ]);
  await expect(page.getByTestId('catalog-list')).toBeVisible();
});

test('пустой список промо-блоков не ломает главную', async ({ page }) => {
  await page.route('**/api/promo', (route) =>
    route.fulfill({ json: { promoBlocks: [] } }),
  );
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Соберите компьютер, которым хочется пользоваться.' }),
  ).toBeVisible();
  await expect(page.getByTestId('home-catalog-link')).toBeVisible();
  await expect(page.locator('.promo-section')).toHaveCount(0);
  await expect(page.getByTestId('home-promo')).toHaveCount(0);
});