import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { accounts, users } from "@/db/schema";
import {
  telegramDisplayName,
  verifyTelegramInitData,
} from "@/lib/telegram/verify-init-data";
import { signTelegramSession } from "@/lib/telegram/session";

const bodySchema = z.object({
  initData: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        {
          error:
            "TELEGRAM_BOT_TOKEN не задан. См. web/TELEGRAM.md (BotFather).",
        },
        { status: 503 },
      );
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Нужен initData" }, { status: 400 });
    }

    const verified = verifyTelegramInitData(parsed.data.initData, botToken);
    const telegramId = String(verified.user.id);
    const name = telegramDisplayName(verified.user);
    const email = `tg_${telegramId}@telegram.local`;

    const db = getDb();
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, "telegram"),
          eq(accounts.providerAccountId, telegramId),
        ),
      )
      .limit(1);

    let userId: string;

    if (existingAccount[0]) {
      userId = existingAccount[0].userId;
      await db
        .update(users)
        .set({ name, image: verified.user.photo_url ?? null })
        .where(eq(users.id, userId));
    } else {
      const existingEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingEmail[0]) {
        userId = existingEmail[0].id;
      } else {
        const [created] = await db
          .insert(users)
          .values({
            email,
            name,
            image: verified.user.photo_url ?? null,
          })
          .returning({ id: users.id });
        if (!created) throw new Error("Не удалось создать пользователя");
        userId = created.id;
      }

      await db.insert(accounts).values({
        userId,
        type: "oauth",
        provider: "telegram",
        providerAccountId: telegramId,
      });
    }

    const token = signTelegramSession(userId, telegramId);

    return NextResponse.json({
      token,
      user: {
        id: userId,
        name,
        telegramId,
      },
      startParam: verified.startParam ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка авторизации Telegram";
    console.error("POST /api/telegram/auth", error);
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
