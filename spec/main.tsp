import "@typespec/http";
import "@typespec/rest";
import "./models/money.tsp";
import "./models/errors.tsp";
import "./models/product.tsp";
import "./models/auth.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;


@service(#{ title: "PC Components Shop" })
@server("http://localhost:3000", "Local development server")
namespace Shop {
  @doc("Проверка работоспособности сервиса.")
  model HealthStatus {
    status: "ok";
  }

  @route("/health")
  @get
  op health(): HealthStatus;

  @route("/api/products")
  @get
  op listProducts(
    @query category?: string,
    @query search?: string,
    @query priceMin: int32 = 0,
    @query priceMax?: int32,
    @query available?: boolean,
    @query page: int32 = 1,
    @query pageSize: int32 = 12,
  ): ProductList | ApiError;

  @route("/api/categories")
  @get
  op listCategories(): CategoryList | ApiError;

  
  @route("/api/auth/signup")
  @post
  op signup(@body body: SignupRequest): ApiError | User;

  @route("/api/auth/signin")
  @post
  op signin(@body body: SigninRequest): ApiError | User;

  @route("/api/auth/logout")
  @post
  op logout(): ApiError | void;

  @route("/api/auth/me")
  @get
  op me(): ApiError | User;
}