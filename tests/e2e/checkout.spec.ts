import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const PASSWORD = 'password123';

const SLUG = 'nova-rtx-5070';
const NAME = 'Видеокарта Nova RTX 5070';
const PRICE = 74990;
const fmt = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function blockExternal(page: Page) {
  await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
  await page.route('https://fonts.gstatic.com/**', (r) => r.abort());
  await page.route('https://picsum.photos/**', (r) => r.abort());
}

async function createUser(request: APIRequestContext, email: string): Promise<void> {
  const response = await request.post('/api/auth/signup', {
    data: { email, password: PASSWORD },
  });
  expect(response.ok()).toBeTruthy();
}

async function signin(page: Page, email: string): Promise<void> {
  await page.goto('/signin');
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(PASSWORD);
  await page.getByTestId('auth-submit').click();
  await expect(page.getByTestId('nav-account')).toBeVisible();
}

async function addProduct(page: Page, slug: string): Promise<void> {
  await page.goto(`/products/${slug}`);
  await page.getByTestId('product-add-to-cart').click();
}

async function placeOrder(page: Page): Promise<void> {
  await page.getByTestId('checkout-name').fill('Иван Иванов');
  await page.getByTestId('checkout-phone').fill('88005553535');
  await page.getByTestId('checkout-address').fill('ул. Тестовая, 1');
  await page.getByTestId('checkout-submit').click();
  await expect(page).toHaveURL(/\/orders\/\d+$/);
}

test('гость не может оформить заказ', async ({ page }) => {
  await blockExternal(page);
  await addProduct(page, SLUG);
  await page.goto('/checkout');
  await expect(page).toHaveURL(/\/signin$/);
});

test('авторизованный пользователь оформляет заказ и видит страницу успеха', async ({ page, request }) => {
  await blockExternal(page);
  const email = uniqueEmail('success');
  await createUser(request, email);
  await signin(page, email);

  await addProduct(page, SLUG);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-checkout').click();
  await placeOrder(page);

  await expect(page.getByTestId('order-success')).toBeVisible();
  await expect(page.getByTestId('order-status')).toHaveAttribute('data-status', 'paid');
  await expect(page.getByTestId('order-total')).toContainText(fmt(PRICE));
  await expect(page.getByTestId('order-item')).toHaveCount(1);
});

test('итоговая сумма складывается из позиций', async ({ page, request }) => {
  await blockExternal(page);
  const email = uniqueEmail('sum');
  await createUser(request, email);
  await signin(page, email);

  await addProduct(page, SLUG);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-item-qty-plus').click();
  await page.getByTestId('cart-checkout').click();
  await placeOrder(page);

  await expect(page.getByTestId('order-total')).toContainText(fmt(PRICE * 2));
});

test('при доставке адрес обязателен, при самовывозе не запрашивается', async ({ page, request }) => {
  await blockExternal(page);
  const email = uniqueEmail('addr');
  await createUser(request, email);
  await signin(page, email);

  await addProduct(page, SLUG);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-checkout').click();

  await page.getByTestId('checkout-name').fill('Иван Иванов');
  await page.getByTestId('checkout-phone').fill('88005553535');
  await page.getByTestId('checkout-submit').click();
  await expect(page.getByTestId('order-error')).toContainText('Укажите адрес доставки');
  await expect(page).not.toHaveURL(/\/orders\//);
  await page.getByTestId('checkout-method').selectOption('pickup');
  await expect(page.getByTestId('checkout-address')).toHaveCount(0);
  await page.getByTestId('checkout-submit').click();
  await expect(page).toHaveURL(/\/orders\/\d+$/);
});

test('заказ с недоступным товаром отклоняется и ошибка видна пользователю', async ({ page, request }) => {
  await blockExternal(page);
  const email = uniqueEmail('unavail');
  await createUser(request, email);
  await signin(page, email);

  await addProduct(page, SLUG);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-checkout').click();
  await page.getByTestId('checkout-name').fill('Иван Иванов');
  await page.getByTestId('checkout-phone').fill('88005553535');
  await page.getByTestId('checkout-address').fill('ул. Тестовая, 1');

  await page.route('**/api/orders', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'ORDER_INVALID',
          message: 'Некоторые товары недоступны',
          items: [{ productId: 999, code: 'UNAVAILABLE', name: NAME }],
        }),
      });
    }
    return route.fallback();
  });

  await page.getByTestId('checkout-submit').click();
  await expect(page.getByTestId('order-error')).toContainText(NAME);
  await expect(page.getByTestId('nav-cart')).toContainText('(1)');
  await expect(page.getByTestId('checkout-form')).toBeVisible();
});

test('в личном кабинете видны свои заказы и не видны чужие', async ({ page, browser, request }) => {
  await blockExternal(page);
  const emailA = uniqueEmail('own-a');
  const emailB = uniqueEmail('other-b');
  await createUser(request, emailA);
  await createUser(request, emailB);

  await signin(page, emailA);
  await addProduct(page, SLUG);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-checkout').click();
  await placeOrder(page);

  const contextB = await browser.newContext({ baseURL: BASE_URL });
  const pageB = await contextB.newPage();
  await blockExternal(pageB);
  await signin(pageB, emailB);
  await pageB.goto('/account');
  await expect(pageB.getByTestId('account-orders-empty')).toBeVisible();
  await contextB.close();

  await page.goto('/account');
  await expect(page.getByTestId('account-order-item')).toHaveCount(1);
});

test('заказ в кабинете показывает состав, количество, цены и итог', async ({ page, request }) => {
  await blockExternal(page);
  const email = uniqueEmail('detail');
  await createUser(request, email);
  await signin(page, email);

  await addProduct(page, SLUG);
  await page.getByTestId('nav-cart').click();
  await page.getByTestId('cart-item-qty-plus').click();
  await page.getByTestId('cart-checkout').click();
  await placeOrder(page);

  await page.goto('/account');
  const card = page.getByTestId('account-order-item');
  await expect(card).toHaveCount(1);
  await expect(card).toContainText(NAME);
  await expect(card.getByTestId('order-status')).toHaveAttribute('data-status', 'paid');
  await expect(card).toContainText(`${fmt(PRICE).replace(' ₽', '')} ₽ × 2`);
  await expect(card.getByTestId('order-total')).toContainText(fmt(PRICE * 2));
});
