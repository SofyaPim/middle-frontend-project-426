import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const PASSWORD = 'password123';

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
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
}

test('новый пользователь регистрируется и оказывается авторизованным', async ({ page }) => {
  const email = uniqueEmail('reg');

  await page.goto('/signup');
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(PASSWORD);
  await page.getByTestId('auth-submit').click();

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByTestId('nav-account')).toBeVisible();
  await expect(page.getByTestId('nav-signout')).toBeVisible();
  await expect(page.getByTestId('nav-signup')).toBeHidden();
  await expect(page.getByTestId('nav-signin')).toBeHidden();
});

test('зарегистрированный пользователь входит по своим email и паролю', async ({ page, request }) => {
  const email = uniqueEmail('in');
  await createUser(request, email);

  await signin(page, email);

  await expect(page.getByTestId('nav-account')).toBeVisible();
  await expect(page.getByTestId('nav-signout')).toBeVisible();
});

test('авторизованный пользователь выходит, и личный раздел перестаёт быть доступен', async ({ page, request }) => {
  const email = uniqueEmail('out');
  await createUser(request, email);

  await signin(page, email);
  await expect(page.getByTestId('nav-account')).toBeVisible();

  await page.getByTestId('nav-signout').click();

  await expect(page.getByTestId('nav-signin')).toBeVisible();
  await page.goto('/account');
  await expect(page).toHaveURL(/\/signin$/);
});

test('регистрация с занятым email отклоняется с понятным сообщением', async ({ page, request }) => {
  const email = uniqueEmail('dup');
  await createUser(request, email);

  await page.goto('/signup');
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill(PASSWORD);
  await page.getByTestId('auth-submit').click();

  await expect(page.getByTestId('auth-error')).toContainText('уже зарегистрирован');
});

test('вход с неверным паролем отклоняется с понятным сообщением', async ({ page, request }) => {
  const email = uniqueEmail('bad');
  await createUser(request, email);

  await page.goto('/signin');
  await page.getByTestId('auth-email').fill(email);
  await page.getByTestId('auth-password').fill('wrong-pass-123');
  await page.getByTestId('auth-submit').click();

  await expect(page.getByTestId('auth-error')).toContainText('Неверный email или пароль');
});

test('после перезагрузки страницы пользователь остаётся авторизованным', async ({ page, request }) => {
  const email = uniqueEmail('reload');
  await createUser(request, email);

  await signin(page, email);
  await expect(page.getByTestId('nav-account')).toBeVisible();

  await page.reload();

  await expect(page.getByTestId('nav-account')).toBeVisible();
  await expect(page.getByTestId('nav-signout')).toBeVisible();
});

test('неавторизованный посетитель не попадает на защищённую страницу по прямому адресу', async ({ page }) => {
  await page.goto('/account');

  await expect(page).toHaveURL(/\/signin$/);
  await expect(page.getByTestId('nav-signup')).toBeVisible();
  await expect(page.getByTestId('nav-account')).toBeHidden();
});