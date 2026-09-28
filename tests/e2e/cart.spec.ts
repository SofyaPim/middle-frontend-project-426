import { expect, test } from '@playwright/test';

async function blockExternal(page: import('@playwright/test').Page) {
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
  await page.route('https://fonts.gstatic.com/**', (r) => r.abort());
  await page.route('https://picsum.photos/**', (r) => r.abort());
}

const SLUG = 'nova-rtx-5070';
const NAME = 'Видеокарта Nova RTX 5070';
const PRICE = 74990;
const fmt = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

test('карточка товара показывает название, цену и описание', async ({ page }) => {
  await blockExternal(page);
  await page.goto(`/products/${SLUG}`);
  await expect(page.getByTestId('product-name')).toHaveText(NAME);
  await expect(page.getByTestId('product-price')).toContainText('₽');
  await expect(page.getByTestId('product-description')).not.toBeEmpty();
});

test('товар добавляется в корзину и появляется в ней', async ({ page }) => {
  await blockExternal(page);
  await page.goto(`/products/${SLUG}`);
  await page.getByTestId('product-add-to-cart').click();
  await expect(page.getByTestId('nav-cart')).toContainText('(1)');
  await page.getByTestId('nav-cart').click();
  await expect(page.getByTestId('cart-item')).toHaveCount(1);
  await expect(page.getByTestId('cart-item-name')).toHaveText(NAME);
});

test('количество меняется и итоговая сумма пересчитывается', async ({ page }) => {
  await blockExternal(page);
  await page.goto(`/products/${SLUG}`);
  await page.getByTestId('product-add-to-cart').click();
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-item-qty-plus').click();
  await expect(page.getByTestId('cart-item-qty')).toHaveText('2');
  await expect(page.getByTestId('cart-total')).toContainText(fmt(PRICE * 2));
  await page.getByTestId('cart-item-qty-minus').click();
  await expect(page.getByTestId('cart-item-qty')).toHaveText('1');
  await expect(page.getByTestId('cart-total')).toContainText(fmt(PRICE));
});

test('позиция удаляется из корзины', async ({ page }) => {
  await blockExternal(page);
  await page.goto(`/products/${SLUG}`);
  await page.getByTestId('product-add-to-cart').click();
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-item-remove').click();
  await expect(page.getByTestId('cart-empty')).toBeVisible();
  await expect(page.getByTestId('cart-item')).toHaveCount(0);
});

test('состав корзины сохраняется после перезагрузки страницы', async ({ page }) => {
  await blockExternal(page);
  await page.goto(`/products/${SLUG}`);
  await page.getByTestId('product-add-to-cart').click();
  await page.reload();
  await expect(page.getByTestId('nav-cart')).toContainText('(1)');
  await page.getByTestId('nav-cart').click();
  await expect(page.getByTestId('cart-item-name')).toHaveText(NAME);
});

test('недоступный товар не добавляется в корзину', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/products/nova-rtx-5060-ti');
  await expect(page.getByTestId('product-add-to-cart')).toBeDisabled();
  await page.getByTestId('nav-cart').click();
  await expect(page.getByTestId('cart-empty')).toBeVisible();
});

test('пустая корзина показывает состояние и не пускает к оформлению', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/cart');
  await expect(page.getByTestId('cart-empty')).toBeVisible();
  await expect(page.getByTestId('cart-checkout')).toHaveCount(0);
});