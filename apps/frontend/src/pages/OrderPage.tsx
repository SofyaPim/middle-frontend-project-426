import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGetOrder } from "../api";
import type { components } from "../generated/schema";

type Order = components["schemas"]["Order"];
const formatPrice = (value: number) => new Intl.NumberFormat("ru-RU").format(value);
const formatDate = (iso: string) => new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGetOrder(Number(id))
      .then(setOrder)
      .catch((err: unknown) => {
        if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "NOT_FOUND") {
          setNotFound(true);
        }
      });
  }, [id]);

  if (notFound) {
    return (
      <main className="page-shell">
        <h1>Заказ не найден</h1>
        <Link className="btn-primary" to="/catalog">
          В каталог <span aria-hidden="true">→</span>
        </Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="page-shell">
        <p className="intro">Загрузка…</p>
      </main>
    );
  }

  return (
    <main className="page-shell" data-testid="order-success">
      <p className="eyebrow">Заказ №{order.id}</p>
      <h1>Заказ успешно оформлен</h1>
      <p className="intro" data-testid="order-status" data-status={order.status}>
        Статус: {order.status === "paid" ? "Оплачен" : order.status} · {formatDate(order.createdAt)}
      </p>
      <ul className="cart-list" data-testid="order-items">
        {order.items.map((item) => (
          <li className="cart-item" key={item.productId} data-testid="order-item">
            <p className="cart-item__status">{item.name}</p>
            <p className="cart-item__price">
              {formatPrice(item.price)} ₽ × {item.quantity}
            </p>
          </li>
        ))}
      </ul>
      <p className="cart-total" data-testid="order-total">
        Итого: {formatPrice(order.total)} ₽
      </p>
      <Link className="btn-primary" to="/catalog">
        В каталог <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}
