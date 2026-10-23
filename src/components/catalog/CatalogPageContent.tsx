"use client";

import { Suspense, useMemo } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { LoadingState } from "@/components/ui/StateMessage";
import {
  attributeOptions,
  filterAttributeNames,
  priceBounds,
  queryProducts,
  toProductCardData,
} from "@/data/catalog-query";
import { parseCatalogParams } from "@/lib/catalog-params";
import { useCatalogState } from "@/store/catalog-store";

type CatalogPageContentProps = {
  title: string;
  description?: string;
  basePath: string;
  categorySlug?: string;
  searchParams: Record<string, string | string[] | undefined>;
  breadcrumbs: { label: string; href?: string }[];
};

export function CatalogPageContent({
  title,
  description,
  basePath,
  categorySlug,
  searchParams,
  breadcrumbs,
}: CatalogPageContentProps) {
  const { products, categories, status } = useCatalogState();

  const filters = parseCatalogParams(searchParams, {
    categorySlug,
    pageSize: 8,
  });

  const result = useMemo(
    () => queryProducts(products, categories, filters),
    [products, categories, filters],
  );

  const cards = result.items.map((item) => toProductCardData(item, categories));
  const categoryOptions = categories.map((item) => ({
    slug: item.slug,
    name: item.name,
  }));
  const bounds = priceBounds(products, categories, categorySlug ?? filters.categorySlug);
  const attrNames = filterAttributeNames(
    products,
    categories,
    categorySlug ?? filters.categorySlug,
  );
  const attributeFilters = attrNames.map((name) => ({
    name,
    options: attributeOptions(
      products,
      categories,
      categorySlug ?? filters.categorySlug,
      name,
    ),
  }));

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v) query.set(key, v);
  }

  if (status === "loading" || status === "idle") {
    return (
      <div className="tm-container py-16">
        <LoadingState title="Загрузка каталога" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="tm-container py-16 text-center text-sm text-tm-danger">
        Не удалось загрузить каталог из базы.
      </div>
    );
  }

  return (
    <div className="tm-container py-6 md:py-8">
      <Breadcrumbs items={breadcrumbs} />
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-tm-ink md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-tm-ink-muted">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mb-6">
        <Suspense fallback={<LoadingState title="Загрузка фильтров" />}>
          <CatalogToolbar
            categories={categoryOptions}
            priceBounds={bounds}
            attributeFilters={attributeFilters}
            showCategoryFilter={!categorySlug}
          />
        </Suspense>
      </div>

      <ProductGrid products={cards} />
      <CatalogPagination
        basePath={basePath}
        queryString={query.toString()}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  );
}
