import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { Prisma, PrismaClient } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { registerAuthRoutes } from "./auth.js";
import { coerceQuery, pickFirstError } from "./validation.js";
import { Value } from "@sinclair/typebox/value";
import { schema } from "../generated/openapi-schema.js";

const app = Fastify({ logger: true });
const prisma = new PrismaClient();
const bugsinkDsn = process.env.BUGSINK_DSN;
const port = Number(process.env.PORT ?? 3000);
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(currentDirectory, "../../frontend/dist");

if (bugsinkDsn) {
  Sentry.init({
    dsn: bugsinkDsn,
    sendDefaultPii: false,
  });
}
// app.get('/api/_monitoring-test-error', async () => {
//   throw new Error('Bugsink backend test');
// });
function toProductDto(p: { id: number; slug: string; name: string; description: string; price: number; imageUrl: string | null; available: boolean; createdAt: Date; updatedAt: Date; category: { id: number; slug: string; name: string } }) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    available: p.available,
    category: { id: p.category.id, slug: p.category.slug, name: p.category.name },
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
app.get("/health", async () => ({ status: "ok" }));

app.get("/api/products", async (request, reply) => {
  const raw = (request.query ?? {}) as Record<string, unknown>;
  const ProductsQuery = schema["/api/products"].GET.args.properties.query;

  const query = Value.Default(ProductsQuery, coerceQuery(raw));
  if (!Value.Check(ProductsQuery, query)) {
    const detail = pickFirstError(Value.Errors(ProductsQuery, query));
    return reply.code(422).send({
      code: "INVALID_QUERY_PARAMS",
      message: "Некорректные параметры фильтрации",
      details: detail ? [detail] : [],
    });
  }

  const page = Math.max(1, typeof query.page === "number" ? query.page : 1);
  const pageSize = Math.min(100, Math.max(1, typeof query.pageSize === "number" ? query.pageSize : 12));
  const where: Prisma.ProductWhereInput = {
    ...(query.category ? { category: { slug: String(query.category) } } : {}),
    ...(query.available === true ? { available: true } : {}),
    ...(typeof query.priceMin === "number" || typeof query.priceMax === "number"
      ? {
          price: {
            ...(typeof query.priceMin === "number" ? { gte: query.priceMin } : {}),
            ...(typeof query.priceMax === "number" ? { lte: query.priceMax } : {}),
          },
        }
      : {}),
    ...(query.search ? { name: { contains: String(query.search), mode: Prisma.QueryMode.insensitive } } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id: "asc" },
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(toProductDto),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
});

app.get("/api/categories", async () => {
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });
  return { categories: categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name })) };
});

app.addHook("onError", async (_request, _reply, error) => {
  if (bugsinkDsn) {
    Sentry.captureException(error);
    await Sentry.flush(2000);
  }
});

await app.register(fastifyStatic, {
  root: frontendDirectory,
  prefix: "/",
  wildcard: false,
});

app.setNotFoundHandler(async (request, reply) => {
  const requestPath = new URL(request.url, "http://localhost").pathname;

  if (requestPath === "/api" || requestPath.startsWith("/api/")) {
    return reply.code(404).send({ message: "Route not found" });
  }

  return reply.sendFile("index.html");
});
await registerAuthRoutes(app, prisma);
await app.listen({ host: "0.0.0.0", port });
