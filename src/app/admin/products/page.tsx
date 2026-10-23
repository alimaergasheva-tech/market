"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPriceUzs } from "@/lib/format";
import { useAdminAuth } from "@/store/admin-auth-store";
import {
  deleteProduct,
  refreshCatalog,
  setProductActive,
  updateProductPrice,
  updateProductStock,
  useCatalogState,
} from "@/store/catalog-store";

export default function AdminProductsPage() {
  const { authenticated } = useAdminAuth();
  const { products, categories } = useCatalogState();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (categoryId && product.categoryId !== categoryId) return false;
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q)
      );
    });
  }, [products, query, categoryId]);

  if (!authenticated) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Товары</h1>
          <p className="mt-1 text-sm text-tm-ink-muted">
            Быстрое редактирование цены и остатка прямо в таблице
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refreshCatalog()}
            className="inline-flex h-10 items-center rounded-tm border border-tm-border px-3 text-sm font-medium"
          >
            Обновить из БД
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center rounded-tm bg-tm-accent px-4 text-sm font-semibold text-white hover:bg-tm-accent-hover"
          >
            Добавить товар
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию"
          className="h-10 min-w-56 flex-1 rounded-tm border border-tm-border bg-tm-surface-raised px-3 text-sm"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="h-10 rounded-tm border border-tm-border bg-tm-surface-raised px-3 text-sm"
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-tm border border-tm-border bg-tm-surface-raised">
        <table className="min-w-full text-sm">
          <thead className="border-b border-tm-border text-left text-tm-ink-muted">
            <tr>
              <th className="px-3 py-3 font-medium">Товар</th>
              <th className="px-3 py-3 font-medium">Категория</th>
              <th className="px-3 py-3 font-medium">Цена</th>
              <th className="px-3 py-3 font-medium">Остаток</th>
              <th className="px-3 py-3 font-medium">Витрина</th>
              <th className="px-3 py-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const category = categories.find((c) => c.id === product.categoryId);
              return (
                <tr key={product.id} className="border-b border-tm-border last:border-0">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-tm-sm bg-tm-surface-sunken">
                        <Image
                          src={product.images[0]?.url ?? "/products/smartphone.jpg"}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="truncate text-xs text-tm-ink-subtle">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-tm-ink-muted">
                    {category?.name ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      defaultValue={product.priceUzs}
                      key={`${product.id}-price-${product.priceUzs}`}
                      onBlur={(e) =>
                        updateProductPrice(product.id, Number(e.target.value) || 0)
                      }
                      className="h-9 w-32 rounded-tm-sm border border-tm-border bg-tm-surface px-2"
                      title={formatPriceUzs(product.priceUzs)}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={0}
                      defaultValue={product.stock}
                      key={`${product.id}-stock-${product.stock}`}
                      onBlur={(e) =>
                        updateProductStock(product.id, Number(e.target.value) || 0)
                      }
                      className="h-9 w-20 rounded-tm-sm border border-tm-border bg-tm-surface px-2"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={product.isActive}
                      onChange={(e) =>
                        setProductActive(product.id, e.target.checked)
                      }
                      aria-label="На витрине"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-tm-accent hover:text-tm-accent-hover"
                      >
                        Изменить
                      </Link>
                      <Link
                        href={`/product/${product.slug}`}
                        className="text-tm-ink-muted hover:text-tm-ink"
                      >
                        Открыть
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Удалить «${product.name}»?`)) {
                            deleteProduct(product.id);
                          }
                        }}
                        className="text-tm-danger hover:underline"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-tm-ink-muted">Ничего не найдено</p>
        ) : null}
      </div>
    </div>
  );
}
