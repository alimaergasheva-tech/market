import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrderFromCart, listOrdersForUser } from "@/data/orders";
import { getRequestUserId } from "@/lib/request-user";

const createSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.string().trim().email(),
  customerPhone: z.string().trim().min(5).max(40),
  deliveryAddress: z.string().trim().min(5).max(500),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .min(1),
});

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  }
  const items = await listOrdersForUser(userId);
  return NextResponse.json({
    items: items.map((order) => ({
      id: order.id,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  try {
    const userId = await getRequestUserId(request);
    const json = await request.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Проверьте контактные данные и состав заказа" },
        { status: 400 },
      );
    }

    const { order, payment } = await createOrderFromCart({
      userId,
      ...parsed.data,
    });

    return NextResponse.json(
      {
        order: {
          id: order.id,
          status: order.status,
          total: Number(order.total),
        },
        payment: payment
          ? { id: payment.id, status: payment.status }
          : null,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось создать заказ";
    console.error("POST /api/orders", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
