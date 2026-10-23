import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  orderItems,
  orders,
  payments,
  products,
} from "@/db/schema";

export type OrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItemInput[];
};

export async function createOrderFromCart(input: CreateOrderInput) {
  if (input.items.length === 0) {
    throw new Error("Корзина пуста");
  }

  const db = getDb();
  const productIds = input.items.map((item) => item.productId);
  const rows = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));

  const byId = new Map(rows.map((row) => [row.id, row]));
  const lines: {
    productId: string;
    productNameSnapshot: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[] = [];

  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product || !product.isActive) {
      throw new Error("Товар недоступен");
    }
    if (product.stockQuantity < item.quantity) {
      throw new Error(`Недостаточно «${product.name}» на складе`);
    }
    if (item.quantity <= 0) {
      throw new Error("Некорректное количество");
    }
    const unitPrice = Number(product.priceUzs);
    lines.push({
      productId: product.id,
      productNameSnapshot: product.name,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const total = subtotal;

  const [order] = await db
    .insert(orders)
    .values({
      userId: input.userId ?? null,
      customerName: input.customerName,
      customerEmail: input.customerEmail.toLowerCase(),
      customerPhone: input.customerPhone,
      deliveryAddress: input.deliveryAddress,
      status: "pending_payment",
      currency: "UZS",
      subtotal,
      total,
      paymentProvider: "yoomoney",
    })
    .returning();

  if (!order) throw new Error("Не удалось создать заказ");

  await db.insert(orderItems).values(
    lines.map((line) => ({
      orderId: order.id,
      productId: line.productId,
      productNameSnapshot: line.productNameSnapshot,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
    })),
  );

  for (const line of lines) {
    const product = byId.get(line.productId)!;
    await db
      .update(products)
      .set({
        stockQuantity: product.stockQuantity - line.quantity,
        updatedAt: new Date(),
      })
      .where(eq(products.id, line.productId));
  }

  const [payment] = await db
    .insert(payments)
    .values({
      orderId: order.id,
      provider: "yoomoney",
      status: "pending",
      amount: total,
    })
    .returning();

  return { order, payment, lines };
}

export async function getOrderForUser(orderId: string, userId?: string | null) {
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  const order = rows[0];
  if (!order) return null;
  if (userId && order.userId && order.userId !== userId) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return { order, items };
}

export async function listOrdersForUser(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

/** Идемпотентная отметка оплаты. */
export async function markOrderPaid(
  orderId: string,
  providerPaymentId: string,
) {
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  const order = rows[0];
  if (!order) return { ok: false as const, reason: "not_found" };
  if (order.status === "paid") {
    return { ok: true as const, already: true, order };
  }
  if (order.status !== "pending_payment") {
    return { ok: false as const, reason: "bad_status", order };
  }

  await db
    .update(orders)
    .set({
      status: "paid",
      paymentReference: providerPaymentId,
      updatedAt: new Date(),
    })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending_payment")));

  await db
    .update(payments)
    .set({
      status: "succeeded",
      providerPaymentId,
      updatedAt: new Date(),
    })
    .where(eq(payments.orderId, orderId));

  const refreshed = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  return { ok: true as const, already: false, order: refreshed[0]! };
}

export async function markOrderPaymentFailed(orderId: string) {
  const db = getDb();
  await db
    .update(orders)
    .set({ status: "payment_failed", updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending_payment")));

  await db
    .update(payments)
    .set({ status: "failed", updatedAt: new Date() })
    .where(eq(payments.orderId, orderId));
}
