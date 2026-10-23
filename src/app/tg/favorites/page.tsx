"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { toProductCardData } from "@/data/catalog-query";
import {
  clearFavorites,
  removeFavorite,
  useFavoriteIds,
} from "@/store/favorites-store";
import { useCatalogState } from "@/store/catalog-store";

export default function TgFavoritesPage() {
  const ids = useFavoriteIds();
  const { products, categories, status } = useCatalogState();

  if (status === "loading" || status === "idle") {
    return <p className="py-10 text-center text-sm text-tm-ink-muted">Загрузка…</p>;
  }

  const cards = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => toProductCardData(item, categories));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2">
        <h1 className="text-xl font-bold tracking-tight">Избранное</h1>
        {cards.length > 0 ? (
          <button
            type="button"
            onClick={() => clearFavorites()}
            className="text-xs font-medium text-tm-ink-muted"
          >
            Очистить
          </button>
        ) : null}
      </div>

      {cards.length === 0 ? (
        <div className="rounded-tm border border-tm-border bg-tm-surface-raised p-5 text-sm text-tm-ink-muted">
          Пока пусто.{" "}
          <Link href="/tg/catalog" className="text-tm-accent">
            В каталог
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {cards.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} basePath="/tg" />
              <button
                type="button"
                onClick={() => removeFavorite(product.id)}
                className="absolute top-2 right-2 z-10 rounded-tm-sm bg-tm-surface-raised/95 px-2 py-1 text-xs"
              >
                Убрать
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
