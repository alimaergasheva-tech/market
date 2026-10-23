import { NextResponse } from "next/server";
import { getOrderForUser } from "@/data/orders";
import { getRequestUserId } from "@/lib/request-user";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const userId = await getRequestUserId(request);
  const { id } = await context.params;
  const result = await getOrderForUser(id, userId);

  if (!result) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  if (result.order.userId && result.order.userId !== userId) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  return NextResponse.json({
    order: {
      id: result.order.id,
      status: result.order.status,
      total: Number(result.order.total),
      customerName: result.order.customerName,
      customerEmail: result.order.customerEmail,
      createdAt: result.order.createdAt.toISOString(),
    },
    items: result.items.map((item) => ({
      name: item.productNameSnapshot,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
  });
}
