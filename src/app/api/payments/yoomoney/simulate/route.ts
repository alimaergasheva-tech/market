import { NextResponse } from "next/server";
import { markOrderPaid } from "@/data/orders";

/** Имитация успешной оплаты (только тест, без карт). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const returnBase = searchParams.get("return") || "/payment/result";
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!orderId) {
    return NextResponse.redirect(`${base}${returnBase}?status=fail`);
  }

  const result = await markOrderPaid(orderId, `test-${orderId}`);
  if (!result.ok) {
    return NextResponse.redirect(
      `${base}${returnBase}?status=fail&order=${orderId}`,
    );
  }

  return NextResponse.redirect(
    `${base}${returnBase}?status=success&order=${orderId}`,
  );
}
