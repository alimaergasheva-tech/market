"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPriceUzs, formatStockLabel } from "@/lib/format";
import {
  clearCompare,
  MAX_COMPARE,
  removeFromCompare,
  useCompareIds,
} from "@/store/compare-store";
import { useCatalogState } from "@/store/catalog-store";

export default function TgComparePage() {
  const ids = useCompareIds();
  const { products, status } = useCatalogState();

  if (status === "loading" || status === "idle") {
    return <p className="py-10 text-center text-sm text-tm-ink-muted">Загрузка…</p>;
  }

  const rows = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const attrNames = [
    ...new Set(rows.flatMap((p) => p.attributes.map((a) => a.name))),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Сравнение</h1>
          <p className="text-xs text-tm-ink-muted">До {MAX_COMPARE} товаров</p>
        </div>
        {rows.length > 0 ? (
          <button
            type="button"
            onClick={() => clearCompare()}
            className="text-xs font-medium text-tm-ink-muted"
          >
            Очистить
          </button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-tm border border-tm-border bg-tm-surface-raised p-5 text-sm text-tm-ink-muted">
          Добавьте товары к сравнению.{" "}
          <Link href="/tg/catalog" className="text-tm-accent">
            Каталог
          </Link>
        </div>
      ) : (
        <div className="space-y-4 overflow-x-auto">
          <div className="flex min-w-max gap-3">
            {rows.map((product) => (
              <div
                key={product.id}
                className="w-40 shrink-0 rounded-tm border border-tm-border bg-tm-surface-raised p-2"
              >
                <div className="relative mb-2 aspect-square overflow-hidden rounded-tm-sm bg-tm-surface-sunken">
                  <Image
                    src={product.images[0]?.url ?? "/products/smartphone.jpg"}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <Link
                  href={`/tg/product/${product.slug}`}
                  className="line-clamp-2 text-xs font-semibold"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm font-bold">
                  {formatPriceUzs(product.priceUzs)}
                </p>
                <p className="text-xs text-tm-ink-muted">
                  {formatStockLabel(product.stock)}
                </p>
                <button
                  type="button"
                  onClick={() => removeFromCompare(product.id)}
                  className="mt-2 text-xs text-tm-danger"
                >
                  Убрать
                </button>
              </div>
            ))}
          </div>

          {attrNames.map((name) => (
            <div key={name} className="space-y-1">
              <p className="text-xs font-medium text-tm-ink-muted">{name}</p>
              <div className="flex min-w-max gap-3">
                {rows.map((product) => (
                  <p
                    key={product.id}
                    className="w-40 shrink-0 text-xs text-tm-ink"
                  >
                    {product.attributes.find((a) => a.name === name)?.value ??
                      "—"}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
