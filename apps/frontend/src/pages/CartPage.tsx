import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiProducts } from '../api';
import { useCart } from '../cart';
import type { components } from '../generated/schema';
import { ProductImage } from '../components/ProductImage';

type Product = components['schemas']['Product'];

const formatPrice = (value: number): string => new Intl.NumberFormat('ru-RU').format(value);

function CartItemRow({ item, product, onSetQuantity, onRemove }: {
  item: { productId: number; quantity: number };
  product: Product | undefined;
  onSetQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const unavailable = product ? !product.available : true;

  return (
    <li className="cart-item" data-testid="cart-item">
      {product ? (
        <>
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            imageClassName="catalog-item__image catalog-item__image--small"
            placeholderClassName="catalog-item__image catalog-item__image--placeholder catalog-item__image--small"
            loading="lazy"
          />
          <Link className="cart-item__name" to={`/products/${product.slug}`} data-testid="cart-item-name">
            {product.name}
          </Link>
          <p className="cart-item__price">{formatPrice(product.price)} ₽</p>
          <p className="cart-item__status" data-available={String(product.available)}>
            {product.available ? 'В наличии' : 'Нет в наличии'}
          </p>
          <div className="cart-item__quantity">
            <button
              type="button"
              className="cart-item__qty-button"
              data-testid="cart-item-qty-minus"
              onClick={() => onSetQuantity(item.quantity - 1)}
              disabled={unavailable}
            >
              −
            </button>
            <span data-testid="cart-item-qty">{item.quantity}</span>
            <button
              type="button"
              className="cart-item__qty-button"
              data-testid="cart-item-qty-plus"
              onClick={() => onSetQuantity(item.quantity + 1)}
              disabled={unavailable}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="cart-item__remove"
            data-testid="cart-item-remove"
            onClick={onRemove}
          >
            Удалить
          </button>
        </>
      ) : (
        <>
          <p className="cart-item__status">Товар больше недоступен в каталоге</p>
          <button
            type="button"
            className="cart-item__remove"
            data-testid="cart-item-remove"
            onClick={onRemove}
          >
            Убрать из корзины
          </button>
        </>
      )}
    </li>
  );
}

export function CartPage() {
  const { items, setQuantity, removeItem } = useCart();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    apiProducts({ pageSize: 100 }, controller.signal)
      .then((data) => setCatalog(data.products))
      .catch(() => setError('Не удалось загрузить данные каталога.'))
      .finally(() => { if (!controller.signal.aborted) return; });
    return () => controller.abort();
  }, []);

  const productById = useMemo(
    () => new Map(catalog.map((p) => [String(p.id), p])),
    [catalog],
  );

  const rows = items.map((item) => ({
    item,
    product: productById.get(String(item.productId)),
  }));

  const total = useMemo(
    () => rows.reduce((sum, { item, product }) => {
      if (!product || !product.available) return sum;
      return sum + product.price * item.quantity;
    }, 0),
    [rows, items],
  );

  if (items.length === 0) {
    return (
      <main className="page-shell" data-testid="cart-page">
        <h1>Корзина</h1>
        <p className="intro" data-testid="cart-empty">
          Корзина пуста.
        </p>
        <Link className="btn-primary" to="/catalog">
          Открыть каталог <span aria-hidden="true">→</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell" data-testid="cart-page">
      <h1>Корзина</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <ul className="cart-list" data-testid="cart-list">
        {rows.map(({ item, product }) => (
          <CartItemRow
            key={item.productId}
            item={item}
            product={product}
            onSetQuantity={(quantity) => setQuantity(item.productId, quantity)}
            onRemove={() => removeItem(item.productId)}
          />
        ))}
      </ul>

      <p className="cart-total" data-testid="cart-total">
        Итого: {formatPrice(total)} ₽
      </p>

      <button
        type="button"
        className="btn-primary"
        data-testid="cart-checkout"
        onClick={() => alert('Оформление заказа появится на следующем шаге')}
      >
        Оформить заказ <span aria-hidden="true">→</span>
      </button>
    </main>
  );
}