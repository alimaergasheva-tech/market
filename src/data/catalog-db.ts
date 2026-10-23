import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  categories,
  productAttributes,
  productImages,
  products,
} from "@/db/schema";
import type { Category, Product, ProductAttribute, ProductImage } from "@/lib/types";

function mapCategory(row: typeof categories.$inferSelect): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
  };
}

function mapProduct(
  row: typeof products.$inferSelect,
  images: ProductImage[],
  attributes: ProductAttribute[],
): Product {
  return {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceUzs: Number(row.priceUzs),
    currency: "UZS",
    stock: row.stockQuantity,
    isActive: row.isActive,
    popularity: row.popularity,
    createdAt: row.createdAt.toISOString().slice(0, 10),
    images,
    attributes,
  };
}

export async function fetchCategoriesFromDb(): Promise<Category[]> {
  const db = getDb();
  const rows = await db.select().from(categories).orderBy(asc(categories.name));
  return rows.map(mapCategory);
}

export async function fetchProductsFromDb(
  includeInactive = false,
): Promise<Product[]> {
  const db = getDb();
  const productRows = includeInactive
    ? await db.select().from(products).orderBy(asc(products.name))
    : await db
        .select()
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(asc(products.name));

  if (productRows.length === 0) return [];

  const ids = productRows.map((row) => row.id);
  const [imageRows, attrRows] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, ids))
      .orderBy(asc(productImages.sortOrder)),
    db
      .select()
      .from(productAttributes)
      .where(inArray(productAttributes.productId, ids))
      .orderBy(asc(productAttributes.sortOrder)),
  ]);

  const imagesByProduct = new Map<string, ProductImage[]>();
  for (const row of imageRows) {
    const list = imagesByProduct.get(row.productId) ?? [];
    list.push({ url: row.url, alt: row.altText, sortOrder: row.sortOrder });
    imagesByProduct.set(row.productId, list);
  }

  const attrsByProduct = new Map<string, ProductAttribute[]>();
  for (const row of attrRows) {
    const list = attrsByProduct.get(row.productId) ?? [];
    list.push({
      name: row.attributeName,
      value: row.attributeValue,
      sortOrder: row.sortOrder,
    });
    attrsByProduct.set(row.productId, list);
  }

  return productRows.map((row) =>
    mapProduct(
      row,
      imagesByProduct.get(row.id) ?? [],
      attrsByProduct.get(row.id) ?? [],
    ),
  );
}

export async function fetchCatalogBundle(includeInactive = false): Promise<{
  categories: Category[];
  products: Product[];
}> {
  const [cats, prods] = await Promise.all([
    fetchCategoriesFromDb(),
    fetchProductsFromDb(includeInactive),
  ]);
  return { categories: cats, products: prods };
}

export async function fetchCategoryBySlugFromDb(
  slug: string,
): Promise<Category | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return rows[0] ? mapCategory(rows[0]) : undefined;
}

export async function fetchProductBySlugFromDb(
  slug: string,
): Promise<Product | undefined> {
  const all = await fetchProductsFromDb(false);
  return all.find((item) => item.slug === slug);
}

export async function fetchProductByIdFromDb(
  id: string,
  includeInactive = true,
): Promise<Product | undefined> {
  const all = await fetchProductsFromDb(includeInactive);
  return all.find((item) => item.id === id);
}
