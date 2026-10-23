"use client";

import { useState } from "react";
import { Heart, Scales, ShoppingCart } from "@phosphor-icons/react";
import { addToCart } from "@/store/cart-store";
import { MAX_COMPARE, toggleCompare, useCompareIds } from "@/store/compare-store";
import { toggleFavorite, useFavoriteIds } from "@/store/favorites-store";

type ProductBuyActionsProps = {
  productId: string;
  stock: number;
};

export function ProductBuyActions({ productId, stock }: ProductBuyActionsProps) {
  const favoriteIds = useFavoriteIds();
  const compareIds = useCompareIds();
  const [qty, setQty] = useState(1);
  const [hint, setHint] = useState<string | null>(null);
  const out = stock <= 0;
  const favorited = favoriteIds.includes(productId);
  const inCompare = compareIds.includes(productId);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-tm-ink">
          <span className="font-medium">Количество</span>
          <input
            type="number"
            min={1}
            max={Math.max(1, stock)}
            value={qty}
            disabled={out}
            onChange={(event) =>
              setQty(Math.max(1, Math.min(stock || 1, Number(event.target.value) || 1)))
            }
            className="h-10 w-20 rounded-tm border border-tm-border bg-tm-surface px-2 text-sm"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={out}
          onClick={() => addToCart(productId, qty)}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-tm bg-tm-accent px-4 text-sm font-semibold text-white hover:bg-tm-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-tm-surface-sunken disabled:text-tm-ink-subtle sm:flex-none sm:min-w-48"
        >
          <ShoppingCart className="size-5" weight="bold" />
          В корзину
        </button>
        <button
          type="button"
          aria-pressed={favorited}
          onClick={() => toggleFavorite(productId)}
          className={`inline-flex size-11 items-center justify-center rounded-tm border ${
            favorited
              ? "border-tm-accent bg-tm-accent-soft text-tm-accent"
              : "border-tm-border text-tm-ink-muted hover:text-tm-accent"
          }`}
          aria-label="Избранное"
        >
          <Heart className="size-5" weight={favorited ? "fill" : "bold"} />
        </button>
        <button
          type="button"
          aria-pressed={inCompare}
          onClick={() => {
            const result = toggleCompare(productId);
            if (result === "limit") {
              setHint(`Не больше ${MAX_COMPARE} товаров в сравнении`);
              window.setTimeout(() => setHint(null), 2500);
            } else {
              setHint(null);
            }
          }}
          className={`inline-flex size-11 items-center justify-center rounded-tm border ${
            inCompare
              ? "border-tm-accent bg-tm-accent-soft text-tm-accent"
              : "border-tm-border text-tm-ink-muted hover:text-tm-accent"
          }`}
          aria-label="Сравнить"
        >
          <Scales className="size-5" weight="bold" />
        </button>
      </div>
      {hint ? (
        <p className="text-sm text-tm-warning" role="status">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
