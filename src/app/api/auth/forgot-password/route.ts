import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { users, verificationTokens } from "@/db/schema";

const bodySchema = z.object({
  email: z.string().trim().email(),
});

/**
 * T120: создаёт verification token. Письмо в MVP не шлём —
 * токен пишем в лог сервера для локальной проверки.
 */
export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Укажите email" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const db = getDb();
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Одинаковый ответ, чтобы не светить наличие аккаунта
    if (rows[0]) {
      const token = randomBytes(24).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60);
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.identifier, email));
      await db.insert(verificationTokens).values({
        identifier: email,
        token,
        expires,
      });
      console.info(
        `[forgot-password] ${email} → /reset-password?token=${token}`,
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Если аккаунт есть, ссылка для сброса будет отправлена (в dev — смотрите лог сервера).",
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password", error);
    return NextResponse.json({ error: "Ошибка запроса" }, { status: 500 });
  }
}
