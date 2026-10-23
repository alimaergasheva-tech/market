import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { cartItems, carts, products } from "@/db/schema";
import { getRequestUserId } from "@/lib/request-user";

async function getOrCreateUserCart(userId: string) {
  const db = getDb();
  const existing = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);
  if (existing[0]) return existing[0];

  const [created] = await db.insert(carts).values({ userId }).returning();
  if (!created) throw new Error("Не удалось создать корзину");
  return created;
}

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Нужен вход" }, { status: 401 });
  }

  const db = getDb();
  const cart = await getOrCreateUserCart(userId);
  const items = await db
    .select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      priceUzs: products.priceUzs,
      stock: products.stockQuantity,
      name: products.name,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .where(eq(cartItems.cartId, cart.id));

  const lines = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: Number(item.priceUzs),
    lineTotal: Number(item.priceUzs) * item.quantity,
    stock: item.stock,
    name: item.name,
  }));
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return NextResponse.json({ items: lines, subtotal });
}

const syncSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive().max(99),
    }),
  ),
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
  const cart = await getOrCreateUserCart(userId);

  for (const item of parsed.data.items) {
    const productRows = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1);
    const product = productRows[0];
    if (!product || !product.isActive || product.stockQuantity <= 0) continue;

    const qty = Math.min(item.quantity, product.stockQuantity);
    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, item.productId),
        ),
      )
      .limit(1);

    if (existing[0]) {
      const nextQty = Math.min(
        Math.max(existing[0].quantity, qty),
        product.stockQuantity,
      );
      await db
        .update(cartItems)
        .set({ quantity: nextQty })
        .where(
          and(
            eq(cartItems.cartId, cart.id),
            eq(cartItems.productId, item.productId),
          ),
        );
    } else {
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId: item.productId,
        quantity: qty,
      });
    }
  }

  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, cart.id));

  const items = await db
    .select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
    })
    .from(cartItems)
    .where(eq(cartItems.cartId, cart.id));

  return NextResponse.json({ items });
}
