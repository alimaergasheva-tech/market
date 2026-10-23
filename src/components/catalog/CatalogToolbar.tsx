"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/catalog-params";
import type { ProductSort } from "@/lib/types";

type AttrFilter = {
  name: string;
  options: string[];
};

type CatalogToolbarProps = {
  categories: { slug: string; name: string }[];
  priceBounds: { min: number; max: number };
  attributeFilters: AttrFilter[];
  showCategoryFilter?: boolean;
};

export function CatalogToolbar({
  categories,
  priceBounds,
  attributeFilters,
  showCategoryFilter = true,
}: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const sort = (searchParams.get("sort") as ProductSort) || "popular";
  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const q = searchParams.get("q") ?? "";

  return (
    <form
      className="space-y-4 rounded-tm border border-tm-border bg-tm-surface-raised p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        update({
          q: String(form.get("q") || "") || null,
          minPrice: String(form.get("minPrice") || "") || null,
          maxPrice: String(form.get("maxPrice") || "") || null,
          sort: String(form.get("sort") || "popular"),
          category: showCategoryFilter
            ? String(form.get("category") || "") || null
            : null,
          ...Object.fromEntries(
            attributeFilters.map((attr) => {
              const key = `attr_${encodeURIComponent(attr.name)}`;
              const value = String(form.get(key) || "");
              return [key, value || null];
            }),
          ),
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-tm-ink">Поиск</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Название товара"
            className="h-10 w-full rounded-tm border border-tm-border bg-tm-surface px-3 text-sm text-tm-ink"
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-tm-ink">Сортировка</span>
          <select
            name="sort"
            defaultValue={sort}
            className="h-10 w-full rounded-tm border border-tm-border bg-tm-surface px-3 text-sm text-tm-ink"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {showCategoryFilter ? (
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-tm-ink">Категория</span>
            <select
              name="category"
              defaultValue={category}
              className="h-10 w-full rounded-tm border border-tm-border bg-tm-surface px-3 text-sm text-tm-ink"
            >
              <option value="">Все</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-tm-ink">Цена от</span>
            <input
              name="minPrice"
              type="number"
              min={0}
              defaultValue={minPrice}
              placeholder={String(priceBounds.min || "")}
              className="h-10 w-full rounded-tm border border-tm-border bg-tm-surface px-3 text-sm text-tm-ink"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-tm-ink">до</span>
            <input
              name="maxPrice"
              type="number"
              min={0}
              defaultValue={maxPrice}
              placeholder={String(priceBounds.max || "")}
              className="h-10 w-full rounded-tm border border-tm-border bg-tm-surface px-3 text-sm text-tm-ink"
            />
          </label>
        </div>
      </div>

      {attributeFilters.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {attributeFilters.map((attr) => {
            const key = `attr_${encodeURIComponent(attr.name)}`;
            return (
              <label key={attr.name} className="block space-y-1.5 text-sm">
                <span className="font-medium text-tm-ink">{attr.name}</span>
                <select
                  name={key}
                  defaultValue={searchParams.get(key) ?? ""}
                  className="h-10 w-full rounded-tm border border-tm-border bg-tm-surface px-3 text-sm text-tm-ink"
                >
                  <option value="">Любое</option>
                  {attr.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-tm bg-tm-accent px-4 text-sm font-semibold text-white hover:bg-tm-accent-hover active:scale-[0.98]"
        >
          Применить
        </button>
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="inline-flex h-10 items-center justify-center rounded-tm border border-tm-border px-4 text-sm font-semibold text-tm-ink hover:border-tm-border-strong active:scale-[0.98]"
        >
          Сбросить
        </button>
      </div>
    </form>
  );
}
