import "@typespec/http";
import "./errors.tsp";
import "./user.tsp";
using TypeSpec.Http;

@doc("Тело запроса регистрации.")
model SignupRequest {
  @doc("Email — логин покупателя. Если адрес уже занят, сервер вернёт 409 EMAIL_TAKEN.")
  @format("email")
  email: string;
  @doc("Пароль. Минимум 8 символов.")
  @minLength(8)
  password: string;
}

@doc("Тело запроса входа.")
model SigninRequest {
  @doc("Email — логин покупателя.")
  @format("email")
  email: string;
  @doc("Пароль.")
  password: string;
}