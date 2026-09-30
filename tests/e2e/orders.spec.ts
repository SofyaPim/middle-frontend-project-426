import { expect, test, type APIRequestContext } from '@playwright/test';

const PASSWORD = 'password123';

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

const delivery = {
  method: 'delivery' as const,
  recipientName: 'Иван Иванов',
  phone: '88005553535',
  address: 'ул. Тестовая, 1',
};

async function signup(request: APIRequestContext, email: string): Promise<void> {
  const response = await request.post('/api/auth/signup', {
    data: { email, password: PASSWORD },
  });
  expect(response.ok()).toBeTruthy();
}

async function productId(request: APIRequestContext, slug: string): Promise<number> {
  const response = await request.get(`/api/products/${slug}`);
  expect(response.ok()).toBeTruthy();
  return (await response.json()).id;
}

test('заказ с недоступным товаром отклоняется целиком и перечисляет проблему', async ({ request }) => {
  const email = uniqueEmail('atomic-unavail');
  await signup(request, email);

  const goodId = await productId(request, 'nova-rtx-5070');
  const badId = await productId(request, 'nova-rtx-5060-ti');

  const response = await request.post('/api/orders', {
    data: {
      items: [
        { productId: goodId, quantity: 1 },
        { productId: badId, quantity: 2 },
      ],
      delivery,
    },
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.code).toBe('ORDER_INVALID');
  expect(body.items).toEqual([
    expect.objectContaining({ productId: badId, code: 'UNAVAILABLE' }),
  ]);
});

test('заказ с несуществующим товаром отклоняется и помечает его как NOT_FOUND', async ({ request }) => {
  const email = uniqueEmail('atomic-missing');
  await signup(request, email);

  const response = await request.post('/api/orders', {
    data: {
      items: [{ productId: 999999, quantity: 1 }],
      delivery,
    },
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.code).toBe('ORDER_INVALID');
  expect(body.items).toEqual([
    expect.objectContaining({ productId: 999999, code: 'NOT_FOUND' }),
  ]);
});

test('после отказа заказ не сохраняется: повторный полностью валидный заказ проходит', async ({ request }) => {
  const email = uniqueEmail('atomic-clean');
  await signup(request, email);

  const goodId = await productId(request, 'nova-rtx-5070');
  const badId = await productId(request, 'nova-rtx-5060-ti');

  const rejected = await request.post('/api/orders', {
    data: {
      items: [
        { productId: goodId, quantity: 1 },
        { productId: badId, quantity: 1 },
      ],
      delivery,
    },
  });
  expect(rejected.status()).toBe(400);

  const ok = await request.post('/api/orders', {
    data: { items: [{ productId: goodId, quantity: 2 }], delivery },
  });
  expect(ok.status()).toBe(201);
  const okBody = await ok.json();
  expect(okBody.status).toBe('paid');
  expect(okBody.items).toHaveLength(1);
  expect(okBody.total).toBe(74990 * 2);
  expect(okBody.items[0]).toEqual(
    expect.objectContaining({ productId: goodId, price: 74990, quantity: 2 }),
  );
});

test('гость не может оформить заказ: 401 AUTH_REQUIRED', async ({ request }) => {
  const response = await request.post('/api/orders', {
    data: {
      items: [{ productId: 1, quantity: 1 }],
      delivery,
    },
  });
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.code).toBe('AUTH_REQUIRED');
});

test('пустая корзина отклоняется: 400 CART_EMPTY', async ({ request }) => {
  const email = uniqueEmail('empty');
  await signup(request, email);

  const response = await request.post('/api/orders', {
    data: { items: [], delivery },
  });
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.code).toBe('CART_EMPTY');
});