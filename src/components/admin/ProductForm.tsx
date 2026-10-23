"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/data/catalog-query";
import type { Product, ProductAttribute } from "@/lib/types";
import {
  PRODUCT_IMAGE_OPTIONS,
  saveProduct,
  useCatalogState,
} from "@/store/catalog-store";

type ProductFormProps = {
  initial: Product;
  mode: "create" | "edit";
};

export function ProductForm({ initial, mode }: ProductFormProps) {
  const router = useRouter();
  const { categories, products } = useCatalogState();
  const [product, setProduct] = useState<Product>(initial);
  const [attrsText, setAttrsText] = useState(
    initial.attributes.map((a) => `${a.name}: ${a.value}`).join("\n"),
  );
  const [error, setError] = useState<string | null>(null);

  const imageUrl = product.images[0]?.url ?? PRODUCT_IMAGE_OPTIONS[0].url;

  const slugTaken = useMemo(
    () =>
      products.some(
        (item) => item.slug === product.slug && item.id !== product.id,
      ),
    [products, product.slug, product.id],
  );

  function parseAttributes(text: string): ProductAttribute[] {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [name, ...rest] = line.split(":");
        return {
          name: (name ?? "Параметр").trim(),
          value: rest.join(":").trim() || "—",
          sortOrder: index,
        };
      });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!product.name.trim()) {
      setError("Укажите название");
      return;
    }
    if (!product.slug.trim() || slugTaken) {
      setError("Slug занят или пустой");
      return;
    }
    if (product.priceUzs < 0) {
      setError("Цена не может быть отрицательной");
      return;
    }

    const next: Product = {
      ...product,
      name: product.name.trim(),
      slug: product.slug.trim(),
      description: product.description.trim(),
      priceUzs: Math.round(product.priceUzs),
      stock: Math.max(0, Math.round(product.stock)),
      currency: "UZS",
      attributes: parseAttributes(attrsText),
      images: [
        {
          url: imageUrl,
          alt: product.name.trim(),
          sortOrder: 0,
        },
      ],
    };

    void saveProduct(next)
      .then(() => router.push("/admin/products"))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Ошибка сохранения");
      });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5 text-sm md:col-span-2">
          <span className="font-medium">Название</span>
          <input
            value={product.name}
            onChange={(e) => {
              const name = e.target.value;
              setProduct((prev) => ({
                ...prev,
                name,
                slug: mode === "create" ? slugify(name) || prev.slug : prev.slug,
              }));
            }}
            className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3"
            required
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Slug (URL)</span>
          <input
            value={product.slug}
            onChange={(e) =>
              setProduct((prev) => ({ ...prev, slug: slugify(e.target.value) }))
            }
            className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3"
            required
          />
          {slugTaken ? (
            <span className="text-xs text-tm-danger">Такой slug уже есть</span>
          ) : null}
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Категория</span>
          <select
            value={product.categoryId}
            onChange={(e) =>
              setProduct((prev) => ({ ...prev, categoryId: e.target.value }))
            }
            className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Цена (сум)</span>
          <input
            type="number"
            min={0}
            step={1000}
            value={product.priceUzs}
            onChange={(e) =>
              setProduct((prev) => ({
                ...prev,
                priceUzs: Number(e.target.value) || 0,
              }))
            }
            className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3"
            required
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Остаток (шт.)</span>
          <input
            type="number"
            min={0}
            value={product.stock}
            onChange={(e) =>
              setProduct((prev) => ({
                ...prev,
                stock: Number(e.target.value) || 0,
              }))
            }
            className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3"
            required
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium">Популярность (0–100)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={product.popularity}
            onChange={(e) =>
              setProduct((prev) => ({
                ...prev,
                popularity: Number(e.target.value) || 0,
              }))
            }
            className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3"
          />
        </label>

        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={product.isActive}
            onChange={(e) =>
              setProduct((prev) => ({ ...prev, isActive: e.target.checked }))
            }
          />
          <span>Показывать на витрине</span>
        </label>

        <label className="block space-y-1.5 text-sm md:col-span-2">
          <span className="font-medium">Описание</span>
          <textarea
            rows={4}
            value={product.description}
            onChange={(e) =>
              setProduct((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3 py-2"
          />
        </label>

        <label className="block space-y-1.5 text-sm md:col-span-2">
          <span className="font-medium">Фото</span>
          <select
            value={imageUrl}
            onChange={(e) =>
              setProduct((prev) => ({
                ...prev,
                images: [
                  {
                    url: e.target.value,
                    alt: prev.name,
                    sortOrder: 0,
                  },
                ],
              }))
            }
            className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3"
          >
            {PRODUCT_IMAGE_OPTIONS.map((option) => (
              <option key={option.url} value={option.url}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5 text-sm md:col-span-2">
          <span className="font-medium">Характеристики (по строке: Название: значение)</span>
          <textarea
            rows={6}
            value={attrsText}
            onChange={(e) => setAttrsText(e.target.value)}
            className="w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3 py-2 font-mono text-xs"
            placeholder={"Экран: 6,6 AMOLED\nПамять: 8/256 ГБ"}
          />
        </label>
      </div>

      {error ? (
        <p className="text-sm text-tm-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-tm bg-tm-accent px-5 text-sm font-semibold text-white hover:bg-tm-accent-hover"
        >
          {mode === "create" ? "Создать товар" : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="inline-flex h-11 items-center rounded-tm border border-tm-border px-5 text-sm font-semibold"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
