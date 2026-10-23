"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Scales, ShoppingCart } from "@phosphor-icons/react";
import { ProductCardTilt } from "@/components/product/ProductCardTilt";
import type { ProductCardData } from "@/lib/types";
import {
  formatPriceUzs,
  formatStockLabel,
  getStockStatus,
} from "@/lib/format";
import { addToCart } from "@/store/cart-store";
import { MAX_COMPARE, toggleCompare, useCompareIds } from "@/store/compare-store";
import { toggleFavorite, useFavoriteIds } from "@/store/favorites-store";

type ProductCardProps = {
  product: ProductCardData;
  /** Префикс маршрута, напр. `/tg` для Mini App. */
  basePath?: string;
};

export function ProductCard({ product, basePath = "" }: ProductCardProps) {
  const productHref = `${basePath}/product/${product.slug}`;
  const favoriteIds = useFavoriteIds();
  const compareIds = useCompareIds();
  const [compareHint, setCompareHint] = useState<string | null>(null);

  const stockStatus = getStockStatus(product.stock);
  const outOfStock = stockStatus === "out";
  const favorited = favoriteIds.includes(product.id);
  const inCompare = compareIds.includes(product.id);

  function handleCompare() {
    const result = toggleCompare(product.id);
    if (result === "limit") {
      setCompareHint(`Можно сравнить не больше ${MAX_COMPARE} товаров`);
      window.setTimeout(() => setCompareHint(null), 2500);
      return;
    }
    setCompareHint(null);
  }

  return (
    <ProductCardTilt className="group/tilt h-full">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-tm border border-tm-border bg-tm-surface-raised shadow-tm transition-[border-color,box-shadow] duration-300 hover:border-tm-border-strong hover:shadow-[0_18px_40px_-18px_rgb(15_23_42_/_0.35)]">
        <Link
          href={productHref}
          className="relative block aspect-[4/3] overflow-hidden bg-tm-surface-sunken"
          style={{ transform: "translateZ(24px)" }}
        >
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          />
        </Link>

        <div
          className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4"
          style={{ transform: "translateZ(16px)" }}
        >
          {product.categoryName ? (
            <p className="text-xs text-tm-ink-subtle">{product.categoryName}</p>
          ) : null}

          <Link href={productHref} className="block">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-tm-ink transition-colors group-hover:text-tm-accent sm:text-[0.95rem]">
              {product.name}
            </h3>
          </Link>

          <div className="mt-auto space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="text-base font-bold tracking-tight text-tm-ink sm:text-lg">
                {formatPriceUzs(product.priceUzs)}
              </p>
              <p
                className={
                  stockStatus === "out"
                    ? "text-xs font-medium text-tm-danger"
                    : stockStatus === "low"
                      ? "text-xs font-medium text-tm-warning"
                      : "text-xs font-medium text-tm-success"
                }
              >
                {formatStockLabel(product.stock)}
              </p>
            </div>

            {compareHint ? (
              <p className="text-xs text-tm-warning" role="status">
                {compareHint}
              </p>
            ) : null}

            <div className="grid grid-cols-[1fr_auto_auto] gap-1.5">
              <button
                type="button"
                disabled={outOfStock}
                onClick={() => addToCart(product.id)}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-tm-sm bg-tm-accent px-2 text-xs font-semibold text-white transition-colors hover:bg-tm-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-tm-surface-sunken disabled:text-tm-ink-subtle"
              >
                <ShoppingCart className="size-4" weight="bold" aria-hidden />
                В корзину
              </button>
              <button
                type="button"
                aria-label={favorited ? "Убрать из избранного" : "В избранное"}
                aria-pressed={favorited}
                onClick={() => toggleFavorite(product.id)}
                className={`inline-flex size-9 items-center justify-center rounded-tm-sm border transition-colors active:scale-[0.98] ${
                  favorited
                    ? "border-tm-accent bg-tm-accent-soft text-tm-accent"
                    : "border-tm-border text-tm-ink-muted hover:border-tm-border-strong hover:text-tm-accent"
                }`}
              >
                <Heart
                  className="size-4"
                  weight={favorited ? "fill" : "bold"}
                  aria-hidden
                />
              </button>
              <button
                type="button"
                aria-label={inCompare ? "Убрать из сравнения" : "Сравнить"}
                aria-pressed={inCompare}
                onClick={handleCompare}
                className={`inline-flex size-9 items-center justify-center rounded-tm-sm border transition-colors active:scale-[0.98] ${
                  inCompare
                    ? "border-tm-accent bg-tm-accent-soft text-tm-accent"
                    : "border-tm-border text-tm-ink-muted hover:border-tm-border-strong hover:text-tm-accent"
                }`}
              >
                <Scales className="size-4" weight="bold" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </article>
    </ProductCardTilt>
  );
}
