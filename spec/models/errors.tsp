import "@typespec/http";
using TypeSpec.Http;

@doc("Детализированная ошибка по полю.")
model ErrorDetail {
  @doc("Поле, к которому относится ошибка (может отсутствовать).")
  field?: string;
  @doc("Человекочитаемое описание ошибки.")
  message: string;
}

@doc("Единый формат ошибки API для всех ресурсов.")
@error
model ApiError {
  @statusCode status: 400 | 401 | 404 | 422 | 500;
  @doc("Машиночитаемый код ошибки.")
  code: string;
  @doc("Человекочитаемое сообщение для пользователя.")
  message: string;
  @doc("Детализация по полям, если применимо.")
  details?: ErrorDetail[];
}