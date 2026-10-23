import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { favorites } from "@/db/schema";
import { getRequestUserId } from "@/lib/request-user";

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  }
  const db = getDb();
  const rows = await db
    .select({ productId: favorites.productId })
    .from(favorites)
    .where(eq(favorites.userId, userId));
  return NextResponse.json({ productIds: rows.map((r) => r.productId) });
}

const syncSchema = z.object({
  productIds: z.array(z.string().uuid()),
});

export async function POST(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  }

  const parsed = syncSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const db = getDb();

  for (const productId of parsed.data.productIds) {
    await db
      .insert(favorites)
      .values({ userId, productId })
      .onConflictDoNothing();
  }

  const rows = await db
    .select({ productId: favorites.productId })
    .from(favorites)
    .where(eq(favorites.userId, userId));

  return NextResponse.json({ productIds: rows.map((r) => r.productId) });
}

export async function PUT(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  }

  const body = z
    .object({ productId: z.string().uuid(), action: z.enum(["add", "remove"]) })
    .safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const db = getDb();

  if (body.data.action === "add") {
    await db
      .insert(favorites)
      .values({ userId, productId: body.data.productId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.productId, body.data.productId),
        ),
      );
  }

  return NextResponse.json({ ok: true });
}
