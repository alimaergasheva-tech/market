"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import {
  findCategoryBySlug,
  queryProducts,
  toProductCardData,
} from "@/data/catalog-query";
import { useCatalogState } from "@/store/catalog-store";

export default function TgCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { products, categories, status } = useCatalogState();
  const category = findCategoryBySlug(categories, slug);

  const cards = useMemo(() => {
    if (!category) return [];
    return queryProducts(products, categories, {
      categorySlug: slug,
      sort: "popular",
      pageSize: 40,
    }).items.map((item) => toProductCardData(item, categories));
  }, [products, categories, category, slug]);

  if (status === "loading" || status === "idle") {
    return <p className="py-10 text-center text-sm text-tm-ink-muted">Загрузка…</p>;
  }

  if (!category) {
    return (
      <div className="space-y-3 text-sm">
        <p>Категория не найдена</p>
        <Link href="/tg/catalog" className="text-tm-accent">
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{category.name}</h1>
        <p className="mt-1 text-sm text-tm-ink-muted">{category.description}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((product) => (
          <ProductCard key={product.id} product={product} basePath="/tg" />
        ))}
      </div>
    </div>
  );
}
