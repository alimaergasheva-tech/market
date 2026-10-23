export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type ProductAttribute = {
  name: string;
  value: string;
  sortOrder: number;
};

export type ProductImage = {
  url: string;
  alt: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  priceUzs: number;
  currency: "UZS";
  stock: number;
  isActive: boolean;
  popularity: number;
  createdAt: string;
  images: ProductImage[];
  attributes: ProductAttribute[];
};

/** Упрощённый вид для карточки каталога. */
export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  priceUzs: number;
  stock: number;
  imageUrl: string;
  imageAlt: string;
  categoryName?: string;
};

export type ProductSort = "price_asc" | "price_desc" | "popular" | "newest";

export type ProductFilters = {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  attributes?: Record<string, string>;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export type ProductsResult = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type DemoUser = {
  id: string;
  email: string;
  name: string;
};
