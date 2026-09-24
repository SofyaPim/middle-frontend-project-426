import "@typespec/http";
using TypeSpec.Http;

@doc("Сумма в рублях — целое число без копеек.")
@minValue(0)
scalar rubles extends int32;