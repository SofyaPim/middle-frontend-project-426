import { expect, test } from '@playwright/test';

test('opens the app and shows the basic storefront content', async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(/\/$/);
  await expect(page).toHaveTitle('PC Parts Store');
  await expect(
    page.getByRole('heading', {
      name: 'Соберите компьютер, которым хочется пользоваться.',
    }),
  ).toBeVisible();
  await expect(
    page.getByText('Каталог комплектующих с понятными характеристиками'),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Открыть каталог/ })).toBeVisible();
});

test('keeps the catalog route available after navigation', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await Promise.all([
    page.waitForURL(/\/catalog$/),
    page.getByRole('link', { name: /Открыть каталог/ }).click({ noWaitAfter: true }),
  ]);
  await expect(page).toHaveTitle('PC Parts Store');
});

test('returns a seeded product catalog from the API', async ({ request }) => {
  const response = await request.get('/api/products');

  expect(response.ok()).toBeTruthy();
  const body = await response.json();

  expect(body.products).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ slug: 'nova-rtx-5070' }),
      expect.objectContaining({ slug: 'coreforge-7' }),
    ]),
  );
});