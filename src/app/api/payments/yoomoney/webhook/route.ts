import { NextResponse } from "next/server";
import { markOrderPaid, markOrderPaymentFailed } from "@/data/orders";


/**
 * Webhook YooMoney. В тесте можно слать JSON:
 * { "orderId": "...", "event": "payment.succeeded", "paymentId": "..." }
 * Не доверяем query success=true — только этот обработчик / simulate.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      orderId?: string;
      event?: string;
      paymentId?: string;
      status?: string;
    };

    if (!body.orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const succeeded =
      body.event === "payment.succeeded" || body.status === "succeeded";
    const failed =
      body.event === "payment.canceled" || body.status === "canceled";

    if (succeeded) {
      const result = await markOrderPaid(
        body.orderId,
        body.paymentId ?? `wh-${body.orderId}`,
      );
      return NextResponse.json({ ok: result.ok, already: "already" in result ? result.already : false });
    }

    if (failed) {
      await markOrderPaymentFailed(body.orderId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, ignored: true });
  } catch (error) {
    console.error("POST /api/payments/yoomoney/webhook", error);
    return NextResponse.json({ error: "webhook failed" }, { status: 500 });
  }
}
