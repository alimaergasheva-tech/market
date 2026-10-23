"use client";

import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/StateMessage";
import { formatPriceUzs, formatStockLabel } from "@/lib/format";
import {
  clearCompare,
  MAX_COMPARE,
  removeFromCompare,
  useCompareIds,
} from "@/store/compare-store";
import { useCatalogState } from "@/store/catalog-store";

export default function ComparePage() {
  const ids = useCompareIds();
  const { products: catalog, status } = useCatalogState();
  const products = ids
    .map((id) => catalog.find((p) => p.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (status === "loading" || status === "idle") {
    return (
      <div className="tm-container py-16 text-center text-sm text-tm-ink-muted">
        Загрузка сравнения…
      </div>
    );
  }

  const attrNames = [
    ...new Set(products.flatMap((product) => product.attributes.map((a) => a.name))),
  ];

  return (
    <div className="tm-container py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Сравнение" },
        ]}
      />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-tm-ink md:text-3xl">
            Сравнение
          </h1>
          <p className="mt-1 text-sm text-tm-ink-muted">
            До {MAX_COMPARE} товаров одновременно
          </p>
        </div>
        {products.length > 0 ? (
          <button
            type="button"
            onClick={() => clearCompare()}
            className="text-sm font-medium text-tm-ink-muted hover:text-tm-danger"
          >
            Очистить
          </button>
        ) : null}
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Нечего сравнивать"
          description="Добавьте товары кнопкой весов на карточке."
          actionHref="/catalog"
          actionLabel="В каталог"
        />
      ) : (
        <div className="overflow-x-auto rounded-tm border border-tm-border bg-tm-surface-raised">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-tm-border">
                <th className="sticky left-0 bg-tm-surface-raised px-4 py-3 text-left font-medium text-tm-ink-muted">
                  Параметр
                </th>
                {products.map((product) => (
                  <th key={product.id} className="min-w-48 px-4 py-3 text-left align-top">
                    <div className="space-y-2">
                      <div className="relative h-28 w-full overflow-hidden rounded-tm-sm bg-tm-surface-sunken">
                        <Image
                          src={product.images[0]?.url ?? "/products/smartphone.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-semibold text-tm-ink hover:text-tm-accent"
                      >
                        {product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCompare(product.id)}
                        className="block text-xs text-tm-ink-muted hover:text-tm-danger"
                      >
                        Убрать
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-tm-border">
                <td className="sticky left-0 bg-tm-surface-raised px-4 py-3 text-tm-ink-muted">
                  Цена
                </td>
                {products.map((product) => (
                  <td key={product.id} className="px-4 py-3 font-semibold text-tm-ink">
                    {formatPriceUzs(product.priceUzs)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-tm-border">
                <td className="sticky left-0 bg-tm-surface-raised px-4 py-3 text-tm-ink-muted">
                  Наличие
                </td>
                {products.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-tm-ink">
                    {formatStockLabel(product.stock)}
                  </td>
                ))}
              </tr>
              {attrNames.map((name) => (
                <tr key={name} className="border-b border-tm-border last:border-0">
                  <td className="sticky left-0 bg-tm-surface-raised px-4 py-3 text-tm-ink-muted">
                    {name}
                  </td>
                  {products.map((product) => {
                    const value =
                      product.attributes.find((attr) => attr.name === name)?.value ?? "—";
                    return (
                      <td key={product.id} className="px-4 py-3 text-tm-ink">
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
