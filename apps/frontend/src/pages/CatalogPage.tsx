import { useEffect, useState } from 'react';
import type { components } from '../generated/schema';
import { apiProducts } from '../api';

type Product = components['schemas']['Product'];

export function CatalogPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiProducts()
      .then((data) => setProducts(data.products))
      .catch(() => setError('Не удалось загрузить каталог.'));
  }, []);

  return (
    <main className="page-shell">
      <p className="eyebrow">CATALOG / 2026</p>
      <h1>Каталог</h1>
      {error ? <p className="form-error">{error}</p> : null}
      {products === null ? (
        <p className="intro">Загрузка…</p>
      ) : (
        <ul className="product-list" data-testid="product-list">
          {products.map((product) => (
            <li key={product.id} className="product-card">
              <h2 className="product-card__name">{product.name}</h2>
              <p className="product-card__category">{product.category}</p>
              <p className="product-card__price">{product.price} ₽</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}