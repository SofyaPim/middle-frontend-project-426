import type { components } from './generated/schema';

type ApiError = components['schemas']['ApiError'];
type CategoryList = components['schemas']['CategoryList'];
type Product = components['schemas']['Product'];
type ProductList = components['schemas']['ProductList'];
type SigninRequest = components['schemas']['SigninRequest'];
type SignupRequest = components['schemas']['SignupRequest'];
type User = components['schemas']['User'];


export type ProductsParams = {
  category?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  available?: boolean;
  page?: number;
  pageSize?: number;
};

export function apiProducts(params: ProductsParams, signal?: AbortSignal): Promise<ProductList> {
  const searchParams = new URLSearchParams();

  if (params.category) searchParams.set('category', params.category);
  if (params.search) searchParams.set('search', params.search);
  if (params.priceMin !== undefined) searchParams.set('priceMin', String(params.priceMin));
  if (params.priceMax !== undefined) searchParams.set('priceMax', String(params.priceMax));
  if (params.available) searchParams.set('available', 'true');
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize));

  const qs = searchParams.toString();

  return request<ProductList>(qs ? `/api/products?${qs}` : '/api/products', { signal });
}

export function apiCategories(): Promise<CategoryList> {
  return request('/api/categories');
}
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

