"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import {
  queryProducts,
  toProductCardData,
} from "@/data/catalog-query";
import { useCatalogState } from "@/store/catalog-store";

export function HomeShowcase() {
  const { products, categories, status } = useCatalogState();

  if (status === "loading" || status === "idle") {
    return (
      <p className="py-10 text-center text-sm text-tm-ink-muted">Загрузка витрины…</p>
    );
  }

  const featured = queryProducts(products, categories, {
    sort: "popular",
    pageSize: 8,
  }).items.map((item) => toProductCardData(item, categories));

  return (
    <>
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-tm-ink">Категории</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="rounded-tm border border-tm-border bg-tm-surface-raised/90 px-4 py-4 backdrop-blur-sm transition-colors hover:border-tm-accent hover:text-tm-accent"
            >
              <p className="text-sm font-semibold text-tm-ink">{category.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-tm-ink-muted">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-tm-ink">Витрина</h2>
          <Link
            href="/catalog"
            className="text-sm font-medium text-tm-accent hover:text-tm-accent-hover"
          >
            Весь каталог
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
