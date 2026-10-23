import type { ProductFilters, ProductSort } from "@/lib/types";

const SORTS: ProductSort[] = ["popular", "newest", "price_asc", "price_desc"];

export function parseSort(value: string | undefined): ProductSort {
  if (value && SORTS.includes(value as ProductSort)) {
    return value as ProductSort;
  }
  return "popular";
}

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseCatalogParams(
  raw: Record<string, string | string[] | undefined>,
  defaults?: { categorySlug?: string; pageSize?: number },
): ProductFilters {
  const q = firstParam(raw.q);
  const sort = parseSort(firstParam(raw.sort));
  const page = Number(firstParam(raw.page) ?? "1") || 1;
  const minRaw = firstParam(raw.minPrice);
  const maxRaw = firstParam(raw.maxPrice);
  const minPrice = minRaw ? Number(minRaw) : undefined;
  const maxPrice = maxRaw ? Number(maxRaw) : undefined;

  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!key.startsWith("attr_")) continue;
    const attrName = decodeURIComponent(key.slice(5));
    const attrValue = firstParam(value);
    if (attrName && attrValue) {
      attributes[attrName] = attrValue;
    }
  }

  return {
    categorySlug: defaults?.categorySlug ?? firstParam(raw.category),
    query: q,
    sort,
    page,
    pageSize: defaults?.pageSize ?? 8,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    attributes: Object.keys(attributes).length ? attributes : undefined,
  };
}

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "popular", label: "Популярные" },
  { value: "newest", label: "Новые" },
  { value: "price_asc", label: "Сначала дешевле" },
  { value: "price_desc", label: "Сначала дороже" },
];
