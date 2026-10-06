import { Link } from "react-router-dom";
import { ProductImage } from "./ProductImage";
import { formatPrice } from "../lib/format";
import type { CartItem } from "../lib/cart";
import type { components } from "../generated/schema";

type Product = components["schemas"]["Product"];

export function CartItemRow({
  item,
  product,
  onSetQuantity,
  onRemove,
}: {
  item: CartItem;
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
          <p className="cart-item__price" data-testid="cart-item-price">
            {formatPrice(product.price)} ₽
          </p>
          <p className="cart-item__status" data-testid="cart-item-availability" data-available={String(product.available)}>
            {product.available ? "В наличии" : "Нет в наличии"}
          </p>
          <div className="cart-item__quantity">
            <button type="button" className="cart-item__qty-button" data-testid="cart-item-qty-minus" onClick={() => onSetQuantity(item.quantity - 1)} disabled={unavailable}>
              −
            </button>
            <input
              className="cart-item__qty-input"
              type="number"
              min={1}
              inputMode="numeric"
              data-testid="cart-item-qty"
              value={item.quantity}
              disabled={unavailable}
              onChange={(e) => {
                const next = Number.parseInt(e.target.value, 10);
                if (Number.isFinite(next) && next >= 1) onSetQuantity(next);
              }}
            />
            <button type="button" className="cart-item__qty-button" data-testid="cart-item-qty-plus" onClick={() => onSetQuantity(item.quantity + 1)} disabled={unavailable}>
              +
            </button>
          </div>
          <button type="button" className="cart-item__remove" data-testid="cart-item-remove" onClick={onRemove}>
            Удалить
          </button>
        </>
      ) : (
        <>
          <p className="cart-item__status">Товар больше недоступен в каталоге</p>
          <button type="button" className="cart-item__remove" data-testid="cart-item-remove" onClick={onRemove}>
            Убрать из корзины
          </button>
        </>
      )}
    </li>
  );
}