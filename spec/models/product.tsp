import "@typespec/http";
import "./money.tsp";
using TypeSpec.Http;

@doc("Категория товаров.")
model Category {
  id: int32;
  @doc("Слаг для URL и фильтров.")
  slug: string;
  @doc("Название категории.")
  name: string;
}

@doc("Товар каталога.")
model Product {
  id: int32;
  @doc("Короткий слаг для URL.")
  slug: string;
  @doc("Название товара.")
  name: string;
  @doc("Краткое описание.")
  description: string;
  @doc("Цена в рублях — целое число без копеек.")
  price: rubles;
  @doc("URL изображения. Если отсутствует — показать заглушку.")
  imageUrl?: string;
  @doc("Доступен ли товар к заказу.")
  available: boolean;
  @doc("Категория — ровно одна, без вложенности.")
  category: Category;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

@doc("Страница каталога с метаданными пагинации.")
model ProductList {
  products: Product[];
  @doc("Метаданные пагинации.")
  pagination: Pagination;
}

@doc("Метаданные пагинации.")
model Pagination {
  page: int32;
  pageSize: int32;
  @doc("Общее количество товаров по фильтру.")
  total: int32;
  @doc("Количество страниц.")
  totalPages: int32;
}

@doc("Ответ со списком категорий.")
model CategoryList {
  categories: Category[];
}