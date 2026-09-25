import "@typespec/http";
using TypeSpec.Http;

@doc("Пользователь магазина: учётная запись и покупатель — одно и то же, отдельной сущности 'клиент' в системе нет.")
model User {
  @doc("Уникальный идентификатор пользователя.")
  id: int32;
  @doc("Email — логин пользователя.")
  @format("email")
  email: string;
  @doc("Дата создания учётной записи.")
  createdAt: utcDateTime;
  @doc("Дата последнего обновления.")
  updatedAt: utcDateTime;
}