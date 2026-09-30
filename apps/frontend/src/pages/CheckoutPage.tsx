import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../cart";
import { apiCreateOrder } from "../api";

export function CheckoutPage() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const [method, setMethod] = useState<"delivery" | "pickup">("delivery");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [problemItems, setProblemItems] = useState<{ productId: number; name?: string; code: string }[]>([]);

  if (items.length === 0) {
    return (
      <main className="page-shell">
        <h1>Оформление заказа</h1>
        <p className="intro">Корзина пуста. Добавьте товары перед оформлением.</p>
        <Link className="btn-primary" to="/catalog">
          Открыть каталог <span aria-hidden="true">→</span>
        </Link>
      </main>
    );
  }
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const order = await apiCreateOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        delivery: {
          method,
          recipientName,
          phone,
          address: method === "delivery" ? address : undefined,
        },
      });
      clearCart();
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      const apiErr = err as { code?: string; message?: string; items?: { productId: number; name?: string; code: string }[] };
      if (apiErr.code === "ORDER_INVALID") {
        setProblemItems(apiErr.items ?? []);
        setError("Некоторые товары недоступны. Обновите корзину.");
      } else {
        setProblemItems([]);
        setError(apiErr.code === "CART_EMPTY" ? "Корзина пуста" : (apiErr.message ?? "Не удалось оформить заказ"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell" data-testid="checkout-page">
      <h1>Оформление заказа</h1>
      {error ? (
        <div className="form-error" data-testid="order-error">
          <p>{error}</p>
          {problemItems.length > 0 ? (
            <ul className="order-error__items">
              {problemItems.map((item) => (
                <li key={item.productId}>{item.name ?? `Товар №${item.productId}`}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} data-testid="checkout-form">
        <fieldset className="checkout-methods" data-testid="checkout-method">
          <legend>Способ получения</legend>
          <label className="catalog-filters__check">
            <input type="radio" name="method" value="delivery" checked={method === "delivery"} onChange={() => setMethod("delivery")} data-testid="method-delivery" />
            Доставка
          </label>
          <label className="catalog-filters__check">
            <input type="radio" name="method" value="pickup" checked={method === "pickup"} onChange={() => setMethod("pickup")} data-testid="method-pickup" />
            Самовывоз
          </label>
        </fieldset>

        <label className="auth-form__row">
          Имя получателя
          <input data-testid="checkout-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
        </label>
        <label className="auth-form__row">
          Телефон
          <input data-testid="checkout-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        {method === "delivery" ? (
          <label className="auth-form__row">
            Адрес (одной строкой)
            <input data-testid="checkout-address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
        ) : null}

        <button type="submit" disabled={submitting} className="btn-primary" data-testid="checkout-submit">
          Оформить заказ
        </button>
      </form>
    </main>
  );
}
