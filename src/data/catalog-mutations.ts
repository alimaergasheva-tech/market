import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  productAttributes,
  productImages,
  products,
} from "@/db/schema";
import type { Product } from "@/lib/types";
import { fetchProductByIdFromDb } from "@/data/catalog-db";

export type ProductWriteInput = {
  id?: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  priceUzs: number;
  stock: number;
  isActive: boolean;
  popularity: number;
  images: { url: string; alt: string; sortOrder: number }[];
  attributes: { name: string; value: string; sortOrder: number }[];
};

async function replaceImagesAndAttrs(
  productId: string,
  input: ProductWriteInput,
) {
  const db = getDb();
  await db.delete(productImages).where(eq(productImages.productId, productId));
  await db
    .delete(productAttributes)
    .where(eq(productAttributes.productId, productId));

  if (input.images.length > 0) {
    await db.insert(productImages).values(
      input.images.map((image) => ({
        productId,
        url: image.url,
        altText: image.alt,
        sortOrder: image.sortOrder,
      })),
    );
  }

  if (input.attributes.length > 0) {
    await db.insert(productAttributes).values(
      input.attributes.map((attr) => ({
        productId,
        attributeName: attr.name,
        attributeValue: attr.value,
        sortOrder: attr.sortOrder,
      })),
    );
  }
}

export async function upsertProduct(input: ProductWriteInput): Promise<Product> {
  const db = getDb();
  const now = new Date();

  if (input.id) {
    await db
      .update(products)
      .set({
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
        description: input.description,
        priceUzs: input.priceUzs,
        stockQuantity: input.stock,
        isActive: input.isActive,
        popularity: input.popularity,
        updatedAt: now,
      })
      .where(eq(products.id, input.id));

    await replaceImagesAndAttrs(input.id, input);
    const updated = await fetchProductByIdFromDb(input.id, true);
    if (!updated) throw new Error("Товар не найден после обновления");
    return updated;
  }

  const [inserted] = await db
    .insert(products)
    .values({
      categoryId: input.categoryId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      priceUzs: input.priceUzs,
      currency: "UZS",
      stockQuantity: input.stock,
      isActive: input.isActive,
      popularity: input.popularity,
    })
    .returning({ id: products.id });

  if (!inserted) throw new Error("Не удалось создать товар");
  await replaceImagesAndAttrs(inserted.id, input);
  const created = await fetchProductByIdFromDb(inserted.id, true);
  if (!created) throw new Error("Товар не найден после создания");
  return created;
}

export async function patchProductFields(
  productId: string,
  patch: Partial<{
    priceUzs: number;
    stock: number;
    isActive: boolean;
  }>,
): Promise<Product | undefined> {
  const db = getDb();
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.priceUzs != null) set.priceUzs = patch.priceUzs;
  if (patch.stock != null) set.stockQuantity = patch.stock;
  if (patch.isActive != null) set.isActive = patch.isActive;

  await db.update(products).set(set).where(eq(products.id, productId));
  return fetchProductByIdFromDb(productId, true);
}

export async function removeProduct(productId: string): Promise<void> {
  const db = getDb();
  await db.delete(products).where(eq(products.id, productId));
}
