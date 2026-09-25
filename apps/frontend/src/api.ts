import type { components } from './generated/schema';

type ApiError = components['schemas']['ApiError'];
type ProductList = components['schemas']['ProductList'];
type SigninRequest = components['schemas']['SigninRequest'];
type SignupRequest = components['schemas']['SignupRequest'];
type User = components['schemas']['User'];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: 'include', ...init });

  if (!response.ok) {
    let error: ApiError = { code: 'UNKNOWN', message: 'Что-то пошло не так' };
    try {
      error = (await response.json()) as ApiError;
    } catch {
      // тело не JSON — оставляем заглушку
    }
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function apiSignup(body: SignupRequest): Promise<User> {
  return request('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function apiSignin(body: SigninRequest): Promise<User> {
  return request('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function apiLogout(): Promise<void> {
  return request('/api/auth/logout', { method: 'POST' });
}

export function apiMe(): Promise<User> {
  return request('/api/auth/me');
}

export function apiProducts(): Promise<ProductList> {
  return request('/api/products');
}