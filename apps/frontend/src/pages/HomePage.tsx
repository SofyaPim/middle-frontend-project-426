import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiPromo } from '../api';
import type { components } from '../generated/schema';

type PromoBlock = components['schemas']['PromoBlock'];

const formatPrice = (value: number): string => new Intl.NumberFormat('ru-RU').format(value);

export function HomePage() {
  const [blocks, setBlocks] = useState<PromoBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isLoaded = !loading && !error;

  useEffect(() => {
    apiPromo()
      .then((data) => setBlocks(data.promoBlocks))
      .catch(() => setError('Не удалось загрузить акции.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-shell">
      <p className="eyebrow">PC COMPONENTS / 2026</p>
      <h1>Соберите компьютер, которым хочется пользоваться.</h1>
      <p className="intro">
        Каталог комплектующих с понятными характеристиками, честными фильтрами
        и заказом в несколько шагов.
      </p>
      <Link className="btn-primary" data-testid="home-catalog-link" to="/catalog">
        Открыть каталог <span aria-hidden="true">→</span>
      </Link>

      {error ? <p className="form-error">{error}</p> : null}

      {isLoaded && blocks.length > 0 ? (
        <section className="promo-section" data-testid="home-promo">
          <h2 className="promo-section__title">Акции</h2>
          <ul className="promo-list">
            {blocks.map((block) => (
              <li key={block.id} className="promo-card">
                <Link
                  className="promo-card__link"
                  to={`/products/${block.product.slug}`}
                  data-testid="home-promo-item"
                >
                  <h3 className="promo-card__title">{block.title}</h3>
                  <p className="promo-card__text">{block.text}</p>
                  <p className="promo-card__product">{block.product.name}</p>
                  <p className="promo-card__price">{formatPrice(block.product.price)} ₽</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}