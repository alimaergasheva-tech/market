"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import {
  queryProducts,
  toProductCardData,
} from "@/data/catalog-query";
import { useCatalogState } from "@/store/catalog-store";

export default function TgHomePage() {
  const { products, categories, status } = useCatalogState();

  if (status === "loading" || status === "idle") {
    return <p className="py-10 text-center text-sm text-tm-ink-muted">Загрузка…</p>;
  }

  const featured = queryProducts(products, categories, {
    sort: "popular",
    pageSize: 6,
  }).items.map((item) => toProductCardData(item, categories));

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-bold tracking-tight">Техника в Ташкенте</h1>
        <p className="mt-1 text-sm text-tm-ink-muted">
          Те же цены и каталог, что на сайте — внутри Telegram.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-tm-ink">Категории</h2>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/tg/category/${category.slug}`}
              className="rounded-tm border border-tm-border bg-tm-surface-raised px-3 py-3"
            >
              <p className="text-sm font-semibold">{category.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-tm-ink-muted">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-2">
          <h2 className="text-sm font-semibold">Витрина</h2>
          <Link href="/tg/catalog" className="text-xs font-medium text-tm-accent">
            Весь каталог
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} basePath="/tg" />
          ))}
        </div>
      </section>
    </div>
  );
}
