import type {
  Category,
  Product,
  ProductCardData,
  ProductFilters,
  ProductsResult,
} from "@/lib/types";

/** Чистые функции каталога — работают с любым массивом товаров (моки или live). */

export function filterActive(products: Product[]): Product[] {
  return products.filter((product) => product.isActive);
}

export function findCategoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function findCategoryById(
  categories: Category[],
  id: string,
): Category | undefined {
  return categories.find((category) => category.id === id);
}

export function findProductBySlug(
  products: Product[],
  slug: string,
): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function findProductById(
  products: Product[],
  id: string,
): Product | undefined {
  return products.find((product) => product.id === id);
}

export function queryProducts(
  products: Product[],
  categories: Category[],
  filters: ProductFilters = {},
): ProductsResult {
  const {
    categorySlug,
    minPrice,
    maxPrice,
    query,
    attributes,
    sort = "popular",
    page = 1,
    pageSize = 12,
  } = filters;

  let items = filterActive(products);

  if (categorySlug) {
    const category = findCategoryBySlug(categories, categorySlug);
    items = category
      ? items.filter((product) => product.categoryId === category.id)
      : [];
  }

  if (typeof minPrice === "number") {
    items = items.filter((product) => product.priceUzs >= minPrice);
  }

  if (typeof maxPrice === "number") {
    items = items.filter((product) => product.priceUzs <= maxPrice);
  }

  if (query?.trim()) {
    const q = query.trim().toLowerCase();
    items = items.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q),
    );
  }

  if (attributes) {
    for (const [name, value] of Object.entries(attributes)) {
      if (!value) continue;
      items = items.filter((product) =>
        product.attributes.some(
          (attr) => attr.name === name && attr.value === value,
        ),
      );
    }
  }

  items = [...items].sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.priceUzs - b.priceUzs;
      case "price_desc":
        return b.priceUzs - a.priceUzs;
      case "newest":
        return b.createdAt.localeCompare(a.createdAt);
      case "popular":
      default:
        return b.popularity - a.popularity;
    }
  });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export function toProductCardData(
  product: Product,
  categories: Category[],
): ProductCardData {
  const category = findCategoryById(categories, product.categoryId);
  const image = product.images[0];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    priceUzs: product.priceUzs,
    stock: product.stock,
    imageUrl: image?.url ?? "/products/smartphone.jpg",
    imageAlt: image?.alt ?? product.name,
    categoryName: category?.name,
  };
}

export function relatedProducts(
  products: Product[],
  product: Product,
  limit = 4,
): Product[] {
  return filterActive(products)
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export function priceBounds(
  products: Product[],
  categories: Category[],
  categorySlug?: string,
): { min: number; max: number } {
  const items = queryProducts(products, categories, {
    categorySlug,
    pageSize: 1000,
  }).items;

  if (items.length === 0) return { min: 0, max: 0 };
  const prices = items.map((item) => item.priceUzs);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function attributeOptions(
  products: Product[],
  categories: Category[],
  categorySlug: string | undefined,
  attributeName: string,
): string[] {
  const items = queryProducts(products, categories, {
    categorySlug,
    pageSize: 1000,
  }).items;
  const values = new Set<string>();
  for (const product of items) {
    for (const attr of product.attributes) {
      if (attr.name === attributeName) values.add(attr.value);
    }
  }
  return [...values].sort((a, b) => a.localeCompare(b, "ru"));
}

export function filterAttributeNames(
  products: Product[],
  categories: Category[],
  categorySlug?: string,
): string[] {
  const items = queryProducts(products, categories, {
    categorySlug,
    pageSize: 1000,
  }).items;
  const counts = new Map<string, number>();
  for (const product of items) {
    for (const attr of product.attributes) {
      counts.set(attr.name, (counts.get(attr.name) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
