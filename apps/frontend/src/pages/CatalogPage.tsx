import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { components } from '../generated/schema';
import { apiCategories, apiProducts, type ProductsParams } from '../api';

type Product = components['schemas']['Product'];
type Category = components['schemas']['Category'];
type Pagination = components['schemas']['Pagination'];

const PAGE_SIZE = 12;

const formatPrice = (value: number): string => new Intl.NumberFormat('ru-RU').format(value);

function parseParamInt(value: string | null): number | undefined {
  if (value === null || value === '') return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') ?? '';
  const searchParam = searchParams.get('search') ?? '';
  const priceMinParam = parseParamInt(searchParams.get('priceMin'));
  const priceMaxParam = parseParamInt(searchParams.get('priceMax'));
  const availableParam = searchParams.get('available') === 'true';
  const page = Math.max(1, parseParamInt(searchParams.get('page')) ?? 1);

  const [searchInput, setSearchInput] = useState(searchParam);
  const [availableChecked, setAvailableChecked] = useState(availableParam);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function updateParams(changes: Record<string, string | null>) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === '') next.delete(key);
          else next.set(key, value);
        }
        if (!('page' in changes)) next.delete('page');
        return next;
      },
    );
  }

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const id = window.setTimeout(() => updateParams({ search: searchInput }), 300);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    setAvailableChecked(availableParam);
  }, [availableParam]);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    apiCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const params: ProductsParams = {
      page,
      pageSize: PAGE_SIZE,
      category: category || undefined,
      search: searchParam || undefined,
      priceMin: priceMinParam,
      priceMax: priceMaxParam,
      available: availableParam ? true : undefined,
    };

    apiProducts(params, controller.signal)
      .then((data) => {
        setProducts(data.products);
        setPagination(data.pagination);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError('Не удалось загрузить каталог.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [category, searchParam, priceMinParam, priceMaxParam, availableParam, page]);

  const handleCategoryChange = (value: string) => updateParams({ category: value || null });
  const handlePriceMinChange = (value: string) => updateParams({ priceMin: value || null });
  const handlePriceMaxChange = (value: string) => updateParams({ priceMax: value || null });
  const handleAvailableChange = (checked: boolean) => {
    setAvailableChecked(checked);
    updateParams({ available: checked ? 'true' : null });
  };
  const handleReset = () => {
    setSearchInput('');
    setAvailableChecked(false);
    setSearchParams({});
  };
  const handlePrevPage = () => updateParams({ page: String(page - 1) });
  const handleNextPage = () => updateParams({ page: String(page + 1) });

  const hasProducts = !loading && !error && products.length > 0;

  return (
    <main className="page-shell">
      <p className="eyebrow">CATALOG / 2026</p>
      <h1>Каталог</h1>

      <div className="catalog-layout">
        <aside className="catalog-filters" data-testid="catalog-filters">
          <h2 className="catalog-filters__title">Фильтры</h2>

          <label className="catalog-filters__label">
            Категория
            <select
              data-testid="filter-category"
              value={category}
              onChange={(event) => handleCategoryChange(event.target.value)}
            >
              <option value="">Все категории</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="catalog-filters__row">
            <label className="catalog-filters__label">
              Цена от
              <input
                data-testid="filter-price-min"
                type="number"
                min={0}
                value={priceMinParam ?? ''}
                onChange={(event) => handlePriceMinChange(event.target.value)}
              />
            </label>
            <label className="catalog-filters__label">
              Цена до
              <input
                data-testid="filter-price-max"
                type="number"
                min={0}
                value={priceMaxParam ?? ''}
                onChange={(event) => handlePriceMaxChange(event.target.value)}
              />
            </label>
          </div>

          <label className="catalog-filters__check">
            <input
              data-testid="filter-available"
              type="checkbox"
              checked={availableChecked}
              onChange={(event) => handleAvailableChange(event.target.checked)}
            />
            Только в наличии
          </label>

          <label className="catalog-filters__label">
            Поиск
            <input
              data-testid="filter-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </label>

          <button data-testid="filter-reset" type="button" onClick={handleReset}>
            Сбросить фильтры
          </button>
        </aside>

        <section className="catalog-main">
          {error ? <p className="form-error">{error}</p> : null}

          {loading ? (
            <p className="intro">Загрузка…</p>
          ) : hasProducts ? (
            <>
              <ul className="catalog-list" data-testid="catalog-list">
                {products.map((product) => (
                  <li key={product.id} className="catalog-item" data-testid="catalog-item">
                    {product.imageUrl ? (
                      <img
                        className="catalog-item__image"
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="catalog-item__image catalog-item__image--placeholder">
                        Без фото
                      </div>
                    )}
                    <p className="catalog-item__category">{product.category.name}</p>
                    <Link
                      to={`/products/${product.slug}`}
                      className="catalog-item__name"
                      data-testid="catalog-item-name"
                    >
                      {product.name}
                    </Link>
                    <p className="catalog-item__description">{product.description}</p>
                    <p className="catalog-item__price" data-testid="catalog-item-price">
                      {formatPrice(product.price)} ₽
                    </p>
                    <p
                      className={`catalog-item__availability catalog-item__availability--${
                        product.available ? 'in' : 'out'
                      }`}
                      data-testid="catalog-item-availability"
                      data-available={String(product.available)}
                    >
                      {product.available ? 'В наличии' : 'Нет в наличии'}
                    </p>
                  </li>
                ))}
              </ul>

              {pagination && pagination.totalPages > 1 ? (
                <nav className="catalog-pagination" data-testid="catalog-pagination">
                  <button
                    data-testid="catalog-page-prev"
                    type="button"
                    onClick={handlePrevPage}
                    disabled={page <= 1}
                  >
                    ← Назад
                  </button>
                  <span className="catalog-pagination__info">
                    Страница {page} из {pagination.totalPages}
                  </span>
                  <button
                    data-testid="catalog-page-next"
                    type="button"
                    onClick={handleNextPage}
                    disabled={page >= pagination.totalPages}
                  >
                    Вперёд →
                  </button>
                </nav>
              ) : null}
            </>
          ) : (
            <p className="catalog-empty" data-testid="catalog-empty">
              Ничего не найдено. Попробуйте изменить условия фильтрации.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}