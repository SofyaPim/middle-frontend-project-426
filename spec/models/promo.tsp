import "@typespec/http";
import "./product.tsp";
using TypeSpec.Http;

@doc("Промо-блок главной страницы: реклама конкретного товара.")
model PromoBlock {
  id: int32;
  @doc("Заголовок блока.")
  title: string;
  @doc("Текст блока.")
  text: string;
  @doc("Рекламируемый товар — целиком внутри блока.")
  product: Product;
}

@doc("Ответ со списком промо-блоков.")
model PromoBlockList {
  promoBlocks: PromoBlock[];
}