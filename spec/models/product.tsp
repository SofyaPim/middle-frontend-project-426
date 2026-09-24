import "@typespec/http";
import "./money.tsp";
using TypeSpec.Http;

@doc("Товар каталога.")
model Product {
  id: int32;
  @doc("Короткий слаг для URL.")
  slug: string;
  @doc("Название товара.")
  name: string;
  @doc("Категория.")
  category: string;
  @doc("Описание.")
  description: string;
  @doc("Цена в рублях.")
  price: rubles;
  @doc("URL изображения.")
  imageUrl?: string;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

@doc("Ответ списка товаров.")
model ProductList {
  products: Product[];
}