import { formatPrice } from "../lib/format";


export function CartSummary({
  total,
  onCheckout,
}: {
  total: number;
  onCheckout: () => void;
}) {
  return (
    <>
      <p className="cart-total" data-testid="cart-total">
        Итого: {formatPrice(total)} ₽
      </p>
      <button type="button" className="btn-primary" data-testid="cart-checkout" onClick={onCheckout}>
        Оформить заказ <span aria-hidden="true">→</span>
      </button>
    </>
  );
}