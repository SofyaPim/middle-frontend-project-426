import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiProduct } from '../api';
import type { components } from '../generated/schema';

type Product = components['schemas']['Product'];

const formatPrice = (value: number): string => new Intl.NumberFormat('ru-RU').format(value);

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);

    apiProduct(slug, controller.signal)
      .then((data) => setProduct(data))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (
          typeof err === 'object' && err !== null &&
          'code' in err && (err as { code: string }).code === 'NOT_FOUND'
        ) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <main className="page-shell">
        <p className="intro">Загрузка…</p>
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="page-shell" data-testid="product-page">
        <p className="eyebrow">404 / CATALOG</p>
        <h1>Товар не найден</h1>
        <p className="intro">Возможно, товар снят с продажи или ссылка устарела.</p>
        <Link className="catalog-link" to="/catalog">
          Открыть каталог <span aria-hidden="true">→</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell" data-testid="product-page">
      <p className="eyebrow">{product.category.name}</p>
      <h1 data-testid="product-name">{product.name}</h1>

      {product.imageUrl ? (
        <img className="product-page__image" src={product.imageUrl} alt={product.name} />
      ) : (
        <div className="product-page__image product-page__image--placeholder">Без фото</div>
      )}

      <p className="product-page__price" data-testid="product-price">
        {formatPrice(product.price)} ₽
      </p>
      <p
        className={`product-page__availability product-page__availability--${
          product.available ? 'in' : 'out'
        }`}
        data-testid="product-availability"
        data-available={String(product.available)}
      >
        {product.available ? 'В наличии' : 'Нет в наличии'}
      </p>
      <p className="product-page__description">{product.description}</p>

      <Link className="catalog-link" to="/catalog">
        В каталог <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}