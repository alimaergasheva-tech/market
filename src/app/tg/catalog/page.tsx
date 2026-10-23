"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import {
  queryProducts,
  toProductCardData,
} from "@/data/catalog-query";
import { useCatalogState } from "@/store/catalog-store";

export default function TgCatalogPage() {
  const { products, categories, status } = useCatalogState();
  const [q, setQ] = useState("");
  const [categorySlug, setCategorySlug] = useState("");

  const result = useMemo(
    () =>
      queryProducts(products, categories, {
        query: q || undefined,
        categorySlug: categorySlug || undefined,
        sort: "popular",
        pageSize: 24,
      }),
    [products, categories, q, categorySlug],
  );

  const cards = result.items.map((item) => toProductCardData(item, categories));

  if (status === "loading" || status === "idle") {
    return <p className="py-10 text-center text-sm text-tm-ink-muted">Загрузка…</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Каталог</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Поиск"
        className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3 text-sm"
      />
      <select
        value={categorySlug}
        onChange={(e) => setCategorySlug(e.target.value)}
        className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3 text-sm"
      >
        <option value="">Все категории</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-tm-ink-muted">{result.total} товаров</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((product) => (
          <ProductCard key={product.id} product={product} basePath="/tg" />
        ))}
      </div>
    </div>
  );
}
