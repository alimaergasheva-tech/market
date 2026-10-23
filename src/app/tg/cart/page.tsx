"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTgMainButton } from "@/components/tg/useTgMainButton";
import { formatPriceUzs } from "@/lib/format";
import {
  clearCart,
  removeFromCart,
  setCartQuantity,
  useCartItems,
} from "@/store/cart-store";
import { useCatalogState } from "@/store/catalog-store";

export default function TgCartPage() {
  const router = useRouter();
  const items = useCartItems();
  const { products, status } = useCatalogState();

  const rows = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        item,
        product,
        lineTotal: product.priceUzs * item.quantity,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  const subtotal = rows.reduce((sum, row) => sum + row.lineTotal, 0);

  const goCheckout = useCallback(() => {
    router.push("/tg/checkout");
  }, [router]);

  useTgMainButton(
    rows.length > 0 ? `Оформить · ${formatPriceUzs(subtotal)}` : null,
    rows.length > 0 ? goCheckout : null,
  );

  if (status === "loading" || status === "idle") {
    return <p className="py-10 text-center text-sm text-tm-ink-muted">Загрузка…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2">
        <h1 className="text-xl font-bold tracking-tight">Корзина</h1>
        {rows.length > 0 ? (
          <button
            type="button"
            onClick={() => clearCart()}
            className="text-xs font-medium text-tm-ink-muted"
          >
            Очистить
          </button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-tm border border-tm-border bg-tm-surface-raised p-5 text-sm text-tm-ink-muted">
          Корзина пуста.{" "}
          <Link href="/tg/catalog" className="text-tm-accent">
            В каталог
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ item, product, lineTotal }) => (
            <li
              key={product.id}
              className="flex gap-3 rounded-tm border border-tm-border bg-tm-surface-raised p-3"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-tm-sm bg-tm-surface-sunken">
                <Image
                  src={product.images[0]?.url ?? "/products/smartphone.jpg"}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <Link
                  href={`/tg/product/${product.slug}`}
                  className="line-clamp-2 text-sm font-semibold"
                >
                  {product.name}
                </Link>
                <p className="text-sm font-bold">{formatPriceUzs(lineTotal)}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={item.quantity}
                    onChange={(e) =>
                      setCartQuantity(product.id, Number(e.target.value) || 1)
                    }
                    className="h-9 w-16 rounded-tm-sm border border-tm-border bg-tm-surface px-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="text-xs text-tm-danger"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {rows.length > 0 ? (
        <p className="text-sm text-tm-ink-muted">
          Итого:{" "}
          <span className="font-bold text-tm-ink">{formatPriceUzs(subtotal)}</span>
        </p>
      ) : null}
    </div>
  );
}
