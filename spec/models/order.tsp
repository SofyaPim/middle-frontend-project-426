import "@typespec/http";
import "./money.tsp";
import "./errors.tsp";
using TypeSpec.Http;

@doc("Способ получения. Город подразумевается один.")
enum DeliveryMethod {
  delivery: "delivery",
  pickup: "pickup",
}

@doc("Данные получения. Адрес обязателен только при доставке (проверяет сервер).")
model DeliveryDetails {
  method: DeliveryMethod;
  @doc("Имя получателя.")
  recipientName: string;
  @doc("Телефон получателя.")
  phone: string;
  @doc("Адрес одной строкой — только для доставки.")
  address?: string;
}

@doc("Позиция корзины в запросе на оформление. Цена не передаётся.")
model OrderItemInput {
  productId: int32;
  @minValue(1)
  quantity: int32;
}

@doc("Снимок товара в позиции заказа — название и цена на момент покупки.")
model OrderItemSnapshot {
  productId: int32;
  name: string;
  price: rubles;
  quantity: int32;
}

@doc("Проблемная позиция при атомарном отказе.")
model OrderItemProblem {
  productId: int32;
  code: "NOT_FOUND" | "UNAVAILABLE";
  name?: string;
}

@doc("Ответ при отклонении заказа целиком с перечнем проблемных товаров.")
@error
model OrderInvalid {
  @statusCode status: 400;
  code: "ORDER_INVALID";
  message: string;
  items: OrderItemProblem[];
}

@doc("Тело запроса на оформление заказа. Итог считает сервер по текущим ценам.")
model CreateOrderRequest {
  items: OrderItemInput[];
  delivery: DeliveryDetails;
}

@doc("Заказ. Оплаты нет — статус сразу 'Оплачен' и не меняется.")
model Order {
  id: int32;
  delivery: DeliveryDetails;
  items: OrderItemSnapshot[];
  @doc("Итоговая сумма в рублях, посчитанная сервером.")
  total: rubles;
  status: "paid";
  createdAt: utcDateTime;
}

@doc("Список заказов пользователя.")
model OrderList {
  orders: Order[];
}