import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { getRequestUserId } from "@/lib/request-user";

const bodySchema = z.object({
  orderId: z.string().uuid(),
});

/**
 * Старт оплаты. Без YOOMONEY_* — тестовый режим (симуляция, без списания).
 * Карточные данные никогда не принимаем и не храним.
 */
export async function POST(request: Request) {
  try {
    const userId = await getRequestUserId(request);
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Нужен orderId" }, { status: 400 });
    }

    const db = getDb();
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parsed.data.orderId))
      .limit(1);
    const order = rows[0];
    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }
    if (order.userId && order.userId !== userId) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }
    if (order.status !== "pending_payment") {
      return NextResponse.json(
        { error: "Заказ уже обработан", status: order.status },
        { status: 409 },
      );
    }

    const base =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const shopId = process.env.YOOMONEY_SHOP_ID;
    const secret = process.env.YOOMONEY_SECRET_KEY;
    const testMode = !shopId || !secret || process.env.YOOMONEY_TEST === "1";

    if (testMode) {
      const returnPath =
        new URL(request.url).searchParams.get("return") || "/payment/result";
      const confirmationUrl = `${base}/api/payments/yoomoney/simulate?orderId=${order.id}&return=${encodeURIComponent(returnPath)}`;
      return NextResponse.json({
        testMode: true,
        confirmationUrl,
        message:
          "Тестовый режим YooMoney: реальных списаний нет. Перейдите по ссылке для имитации успеха.",
      });
    }

    // Реальная интеграция: создать платёж у YooMoney API с shopId/secret.
    // Пока ключи есть, но полный API-клиент подключается после проверки кабинета.
    return NextResponse.json(
      {
        error:
          "YooMoney ключи заданы, но полный API-клиент ещё не подключён. Поставьте YOOMONEY_TEST=1 для симуляции.",
      },
      { status: 501 },
    );
  } catch (error) {
    console.error("POST /api/payments/yoomoney/create", error);
    return NextResponse.json({ error: "Ошибка оплаты" }, { status: 500 });
  }
}
