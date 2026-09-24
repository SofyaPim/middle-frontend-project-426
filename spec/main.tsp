import "@typespec/http";
import "@typespec/rest";
import "./models/money.tsp";
import "./models/errors.tsp";
import "./models/product.tsp";

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
  op listProducts(): ProductList | ApiError;
}