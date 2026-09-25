import { expect, test } from '@playwright/test';

async function blockExternal(page: import('@playwright/test').Page) {
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
  await page.route('https://fonts.gstatic.com/**', (r) => r.abort());
  await page.route('https://picsum.photos/**', (r) => r.abort());
}

test('nav-catalog на лендинге ведёт в каталог', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('nav-catalog')).toBeVisible();
  await Promise.all([
    page.waitForURL('**/catalog'),
    page.getByTestId('nav-catalog').click(),
  ]);
  await expect(page.getByTestId('catalog-list')).toBeVisible();
});

test('каталог загружается и показывает карточки', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  await expect(page.getByTestId('catalog-list')).toBeVisible();
  await expect(page.getByTestId('catalog-item').first()).toBeVisible();
  expect(await page.getByTestId('catalog-item').count()).toBeGreaterThan(1);
});

test('в карточке есть название, цена и доступность', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  const card = page.getByTestId('catalog-item').first();
  await expect(card).toBeVisible();
  const name = card.getByTestId('catalog-item-name');
  await expect(name).toBeVisible();
  await expect(name).toHaveAttribute('href', /\/products\//);
  await expect(card.getByTestId('catalog-item-price')).toContainText('₽');
  const availability = card.getByTestId('catalog-item-availability');
  await expect(availability).toHaveAttribute('data-available', /true|false/);
});

test('недоступный товар помечен data-available=false', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  const out = page.locator(
    '[data-testid="catalog-item-availability"][data-available="false"]',
  );
  await expect(out.first()).toBeVisible();
});

test('фильтр по категории сужает список', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  await page.getByTestId('filter-category').selectOption('cpus');
  await expect(page.getByTestId('catalog-item').first()).toContainText('Процессор');
  await expect(page.getByText('Видеокарта Nova RTX 5070')).toBeHidden();
  const texts = await page.getByTestId('catalog-item').allTextContents();
  for (const t of texts) expect(t).toContain('Процессор');
});

test('поиск по части названия оставляет подходящие товары', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  await page.getByTestId('filter-search').fill('rtx');
  await expect(page.getByTestId('catalog-item').first()).toContainText('RTX');
  await expect(page.getByText('SSD Nova NVMe 1TB')).toBeHidden();
  await expect(page.getByText('Память Nova DDR4 8GB')).toBeHidden();
});

test('фильтр по цене меняет состав выдачи', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  await page.getByTestId('filter-price-min').fill('50000');
  await expect(page.getByText('Видеокарта Nova RTX 5070')).toBeVisible();
  await expect(page.getByText('Память Nova DDR4 8GB')).toBeHidden();
});

test('сброс фильтров возвращает полный список', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  await page.getByTestId('filter-category').selectOption('cpus');
  await expect(page.getByTestId('catalog-item').first()).toContainText('Процессор');
  await page.getByTestId('filter-reset').click();
  await expect(page.getByText('Видеокарта Nova RTX 5070')).toBeVisible();
  expect(new URL(page.url()).search).toBe('');
  await expect(page.getByTestId('filter-category')).toHaveValue('');
});

test('комбинация фильтров без совпадений показывает пустое состояние', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  await page.getByTestId('filter-category').selectOption('cpus');
  await page.getByTestId('filter-search').fill('rtx');
  await expect(page.getByTestId('catalog-empty')).toBeVisible();
});

test('переход на следующую страницу меняет набор карточек', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  await expect(page.getByTestId('catalog-item').first()).toContainText('Nova RTX 5070');
  await page.getByTestId('catalog-page-next').click();
  expect(new URL(page.url()).searchParams.get('page')).toBe('2');
  await expect(page.getByTestId('catalog-item').first()).toContainText('CoreForge 3');
  await page.getByTestId('catalog-page-prev').click();
  await expect(page.getByTestId('catalog-item').first()).toContainText('Nova RTX 5070');
});

test('смена фильтра возвращает на первую страницу', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  await page.getByTestId('catalog-page-next').click();
  expect(new URL(page.url()).searchParams.get('page')).toBe('2');
  await page.getByTestId('filter-category').selectOption('gpus');
  expect(new URL(page.url()).searchParams.get('page')).toBeNull();
  await expect(page.getByTestId('catalog-item').first()).toContainText('Nova RTX 5070');
});

test('на первой странице «назад» не ведёт на несуществующую страницу', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  await expect(page.getByTestId('catalog-page-prev')).toBeDisabled();
  await expect(page.getByTestId('catalog-page-next')).toBeEnabled();
});

test('перезагрузка сохраняет фильтры и выдачу', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  await page.getByTestId('filter-category').selectOption('cpus');
  await page.getByTestId('filter-search').fill('CoreForge');
  await expect(page.getByTestId('catalog-item').first()).toContainText('CoreForge');
  await page.reload();
  await expect(page.getByTestId('filter-category')).toHaveValue('cpus');
  await expect(page.getByTestId('filter-search')).toHaveValue('CoreForge');
  await expect(page.getByTestId('catalog-item').first()).toContainText('CoreForge');
  await expect(page.getByText('Видеокарта Nova RTX 5070')).toBeHidden();
});

test('«назад» после смены фильтра возвращает предыдущую выдачу', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/catalog');
  await expect(page.getByTestId('catalog-item').first()).toContainText('Nova RTX 5070');
  await page.getByTestId('filter-category').selectOption('cpus');
  await expect(page.getByTestId('catalog-item').first()).toContainText('Процессор');
  await page.goBack();
  await expect(page.getByTestId('catalog-item').first()).toBeVisible();
  await expect(page.getByText('Видеокарта Nova RTX 5070')).toBeVisible();
});