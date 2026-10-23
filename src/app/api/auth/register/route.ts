import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(128),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Нужны имя, email и пароль от 6 символов." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const db = getDb();
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing[0]) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже есть." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const [created] = await db
      .insert(users)
      .values({
        email,
        name: parsed.data.name,
        passwordHash,
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    return NextResponse.json({ user: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/register", error);
    return NextResponse.json({ error: "Регистрация не удалась" }, { status: 500 });
  }
}
