import {
  attributeOptions,
  filterAttributeNames,
  findCategoryById,
  findCategoryBySlug,
  findProductById,
  findProductBySlug,
  priceBounds,
  queryProducts,
  relatedProducts,
  toProductCardData as toCard,
} from "@/data/catalog-query";
import {
  fetchCatalogBundle,
  fetchCategoriesFromDb,
  fetchCategoryBySlugFromDb,
  fetchProductByIdFromDb,
  fetchProductBySlugFromDb,
  fetchProductsFromDb,
} from "@/data/catalog-db";
import type {
  Category,
  Product,
  ProductCardData,
  ProductFilters,
  ProductsResult,
} from "@/lib/types";

/** Каталог из Neon. Клиентская витрина подгружает тот же снимок через /api/catalog. */

export async function getCategories(): Promise<Category[]> {
  return fetchCategoriesFromDb();
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  return fetchCategoryBySlugFromDb(slug);
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const cats = await fetchCategoriesFromDb();
  return findCategoryById(cats, id);
}

export async function getAllProducts(): Promise<Product[]> {
  return fetchProductsFromDb(false);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  return fetchProductBySlugFromDb(slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return fetchProductByIdFromDb(id, true);
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductsResult> {
  const { categories, products } = await fetchCatalogBundle(false);
  return queryProducts(products, categories, filters);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const products = await fetchProductsFromDb(false);
  return relatedProducts(products, product, limit);
}

export async function toProductCardData(
  product: Product,
): Promise<ProductCardData> {
  const cats = await fetchCategoriesFromDb();
  return toCard(product, cats);
}

export async function getFeaturedProducts(
  limit = 8,
): Promise<ProductCardData[]> {
  const result = await getProducts({ sort: "popular", pageSize: limit });
  const cats = await getCategories();
  return result.items.map((item) => toCard(item, cats));
}

export async function getPriceBounds(
  categorySlug?: string,
): Promise<{ min: number; max: number }> {
  const { categories, products } = await fetchCatalogBundle(false);
  return priceBounds(products, categories, categorySlug);
}

export async function getAttributeOptions(
  categorySlug: string | undefined,
  attributeName: string,
): Promise<string[]> {
  const { categories, products } = await fetchCatalogBundle(false);
  return attributeOptions(products, categories, categorySlug, attributeName);
}

export async function getFilterAttributeNames(
  categorySlug?: string,
): Promise<string[]> {
  const { categories, products } = await fetchCatalogBundle(false);
  return filterAttributeNames(products, categories, categorySlug);
}

export async function getCatalogSnapshot(includeInactive = false) {
  return fetchCatalogBundle(includeInactive);
}

export { findProductBySlug, findProductById, findCategoryBySlug };
