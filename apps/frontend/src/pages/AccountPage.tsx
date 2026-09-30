import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { components } from "../generated/schema";
import { useAuth } from "../auth";
import { apiOrders } from "../api";

type Order = components["schemas"]["Order"];
const formatPrice = (value: number) => new Intl.NumberFormat("ru-RU").format(value);
const formatDate = (iso: string) => new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function AccountPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiOrders()
      .then((data) => setOrders(data.orders))
      .catch((err: unknown) => {
        const apiErr = err as { message?: string };
        setError(apiErr.message ?? "Не удалось загрузить заказы");
      });
  }, []);

  return (
    <main className="page-shell">
      <p className="eyebrow">ACCOUNT / 2026</p>
      <h1>Личный кабинет</h1>
      {user ? (
        <p className="intro" data-testid="account-email">
          Вы вошли как {user.email}.
        </p>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      {orders === null && !error ? (
        <p className="intro">Загрузка…</p>
      ) : orders !== null && orders.length === 0 ? (
        <p className="intro" data-testid="account-orders-empty">
          Заказов пока нет.
        </p>
      ) : orders !== null ? (
        <ul className="cart-list" data-testid="account-orders">
          {orders.map((order) => (
            <li className="cart-item" key={order.id} data-testid="account-order-item">
              <p className="cart-item__status">
                Заказ №{order.id} · {formatDate(order.createdAt)}
              </p>
              <p className="account-order__status" data-testid="order-status" data-status={order.status}>
                {order.status === "paid" ? "Оплачен" : order.status}
              </p>
              <ul className="account-order__items">
                {order.items.map((item) => (
                  <li key={item.productId}>
                    {item.name} · {formatPrice(item.price)} ₽ × {item.quantity}
                  </li>
                ))}
              </ul>
              <p className="cart-total" data-testid="order-total">
                Итого: {formatPrice(order.total)} ₽
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
