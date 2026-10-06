import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiProducts } from "../api";
import { useCart } from "../cart";
import type { components } from "../generated/schema";
import { CartItemRow } from "../components/CartItemRow";
import { CartSummary } from "../components/CartSummary";

type Product = components["schemas"]["Product"];

export function CartPage() {
  const { items, setQuantity, removeItem } = useCart();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    apiProducts({ pageSize: 100 }, controller.signal)
      .then((data) => setCatalog(data.products))
      .catch(() => setError("Не удалось загрузить данные каталога."))
      .finally(() => {
        if (!controller.signal.aborted) return;
      });
    return () => controller.abort();
  }, []);

  const productById = useMemo(() => new Map(catalog.map((p) => [String(p.id), p])), [catalog]);

  const rows = items.map((item) => ({
    item,
    product: productById.get(String(item.productId)),
  }));

  const total = useMemo(
    () =>
      rows.reduce((sum, { item, product }) => {
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
      <CartSummary total={total} onCheckout={() => navigate("/checkout")} />
    </main>
  );
}