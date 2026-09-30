import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { Value } from "@sinclair/typebox/value";
import { schema } from "../generated/openapi-schema.js";
import { getSessionUser } from "./auth.js";

const CreateOrderBody = schema["/api/orders"].POST.args.properties.body;

function toOrderDto(order: any) {
  return {
    id: order.id,
    delivery: {
      method: order.method,
      recipientName: order.recipientName,
      phone: order.phone,
      address: order.address,
    },
    items: order.items.map((i: any) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
    total: order.total,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  };
}

export async function registerOrderRoutes(app: FastifyInstance, prisma: PrismaClient): Promise<void> {
  app.post("/api/orders", async (request, reply) => {
    const user = await getSessionUser(request, prisma);
    if (!user) {
      return reply.code(401).send({ code: "AUTH_REQUIRED", message: "Необходима авторизация" });
    }

    const body = (request.body ?? {}) as Record<string, unknown>;
    if (!Value.Check(CreateOrderBody, body)) {
      return reply.code(422).send({
        code: "INVALID_REQUEST_BODY",
        message: "Проверьте правильность заполнения полей",
        details: [],
      });
    }

    const items = body.items as { productId: number; quantity: number }[];
    const delivery = body.delivery as { method: "delivery" | "pickup"; recipientName: string; phone: string; address?: string };
    if (delivery.method === "delivery" && !delivery.address?.trim()) {
      return reply.code(422).send({
        code: "INVALID_REQUEST_BODY",
        message: "Укажите адрес доставки",
        details: [{ field: "address", message: "Адрес обязателен при доставке" }],
      });
    }
    if (items.length === 0) {
      return reply.code(400).send({ code: "CART_EMPTY", message: "Корзина пуста" });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    const problems = items
      .filter((i) => {
        const p = productById.get(i.productId);
        return !p || !p.available;
      })
      .map((i) => ({
        productId: i.productId,
        code: productById.get(i.productId) ? ("UNAVAILABLE" as const) : ("NOT_FOUND" as const),
        name: productById.get(i.productId)?.name,
      }));

    if (problems.length > 0) {
      return reply.code(400).send({
        code: "ORDER_INVALID",
        message: "Некоторые товары недоступны",
        items: problems,
      });
    }

    const total = items.reduce((sum, i) => {
      const p = productById.get(i.productId)!;
      return sum + p.price * i.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user.id,
          method: delivery.method,
          recipientName: delivery.recipientName,
          phone: delivery.phone,
          address: delivery.method === "delivery" ? delivery.address : null,
          total,
          status: "paid",
          items: {
            create: items.map((i) => {
              const p = productById.get(i.productId)!;
              return { productId: i.productId, name: p.name, price: p.price, quantity: i.quantity };
            }),
          },
        },
        include: { items: true },
      });
      return created;
    });

    return reply.code(201).send(toOrderDto(order));
  });
  app.get("/api/orders", async (request, reply) => {
    const user = await getSessionUser(request, prisma);
    if (!user) {
      return reply.code(401).send({ code: "AUTH_REQUIRED", message: "Необходима авторизация" });
    }
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    return { orders: orders.map(toOrderDto) };
  });
  app.get("/api/orders/:id", async (request, reply) => {
    const user = await getSessionUser(request, prisma);
    if (!user) {
      return reply.code(401).send({ code: "AUTH_REQUIRED", message: "Необходима авторизация" });
    }
    const id = Number((request.params as { id: string }).id);
    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
      include: { items: true },
    });
    if (!order) {
      return reply.code(404).send({ code: "NOT_FOUND", message: "Заказ не найден" });
    }
    return reply.send(toOrderDto(order));
  });
}
