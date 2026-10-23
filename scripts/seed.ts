/**
 * Сид каталога из моков в Neon.
 * Запуск: npm run db:seed (нужен DATABASE_URL в .env.local)
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { MOCK_CATEGORIES } from "../src/data/mocks/categories";
import { MOCK_PRODUCTS } from "../src/data/mocks/products";
import {
  categories,
  productAttributes,
  productImages,
  products,
  users,
} from "../src/db/schema";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL не задан. См. web/NEON.md");
  }

  const db = drizzle(neon(url));

  console.log("Seed: категории…");
  const categoryIdByMock = new Map<string, string>();

  for (const category of MOCK_CATEGORIES) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, category.slug))
      .limit(1);

    if (existing[0]) {
      categoryIdByMock.set(category.id, existing[0].id);
      await db
        .update(categories)
        .set({
          name: category.name,
          description: category.description,
        })
        .where(eq(categories.id, existing[0].id));
      continue;
    }

    const [inserted] = await db
      .insert(categories)
      .values({
        name: category.name,
        slug: category.slug,
        description: category.description,
      })
      .returning({ id: categories.id });

    if (!inserted) throw new Error(`Не удалось создать категорию ${category.slug}`);
    categoryIdByMock.set(category.id, inserted.id);
  }

  console.log("Seed: товары…");
  for (const product of MOCK_PRODUCTS) {
    const categoryId = categoryIdByMock.get(product.categoryId);
    if (!categoryId) {
      throw new Error(`Нет категории для ${product.slug}`);
    }

    const existing = await db
      .select()
      .from(products)
      .where(eq(products.slug, product.slug))
      .limit(1);

    let productId: string;

    if (existing[0]) {
      productId = existing[0].id;
      await db
        .update(products)
        .set({
          categoryId,
          name: product.name,
          description: product.description,
          priceUzs: product.priceUzs,
          currency: product.currency,
          stockQuantity: product.stock,
          isActive: product.isActive,
          popularity: product.popularity,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      await db.delete(productImages).where(eq(productImages.productId, productId));
      await db
        .delete(productAttributes)
        .where(eq(productAttributes.productId, productId));
    } else {
      const [inserted] = await db
        .insert(products)
        .values({
          categoryId,
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceUzs: product.priceUzs,
          currency: product.currency,
          stockQuantity: product.stock,
          isActive: product.isActive,
          popularity: product.popularity,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(),
        })
        .returning({ id: products.id });

      if (!inserted) throw new Error(`Не удалось создать товар ${product.slug}`);
      productId = inserted.id;
    }

    if (product.images.length > 0) {
      await db.insert(productImages).values(
        product.images.map((image) => ({
          productId,
          url: image.url,
          altText: image.alt,
          sortOrder: image.sortOrder,
        })),
      );
    }

    if (product.attributes.length > 0) {
      await db.insert(productAttributes).values(
        product.attributes.map((attr) => ({
          productId,
          attributeName: attr.name,
          attributeValue: attr.value,
          sortOrder: attr.sortOrder,
        })),
      );
    }
  }

  console.log("Seed: демо-пользователь…");
  const demoEmail = "demo@technomarket.uz";
  const demoHash = await bcrypt.hash("demo123", 10);
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, demoEmail))
    .limit(1);
  if (existingUser[0]) {
    await db
      .update(users)
      .set({
        name: "Демо Покупатель",
        passwordHash: demoHash,
      })
      .where(eq(users.id, existingUser[0].id));
  } else {
    await db.insert(users).values({
      email: demoEmail,
      name: "Демо Покупатель",
      passwordHash: demoHash,
    });
  }

  console.log(
    `Готово: ${MOCK_CATEGORIES.length} категорий, ${MOCK_PRODUCTS.length} товаров, демо ${demoEmail}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
