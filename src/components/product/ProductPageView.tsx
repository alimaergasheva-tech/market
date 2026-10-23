"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductBuyActions } from "@/components/product/ProductBuyActions";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import {
  findCategoryById,
  relatedProducts,
  toProductCardData,
} from "@/data/catalog-query";
import { formatPriceUzs, formatStockLabel, getStockStatus } from "@/lib/format";
import { useCatalogState } from "@/store/catalog-store";

export function ProductPageView({ slug }: { slug: string }) {
  const { products, categories, status } = useCatalogState();
  const product = products.find((item) => item.slug === slug && item.isActive);

  if (status === "loading" || status === "idle") {
    return (
      <div className="tm-container py-16 text-center text-sm text-tm-ink-muted">
        Загрузка товара…
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const category = findCategoryById(categories, product.categoryId);
  const related = relatedProducts(products, product, 4).map((item) =>
    toProductCardData(item, categories),
  );
  const stockStatus = getStockStatus(product.stock);

  return (
    <div className="tm-container py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/catalog" },
          ...(category
            ? [{ label: category.name, href: `/category/${category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div className="space-y-5">
          {category ? (
            <Link
              href={`/category/${category.slug}`}
              className="text-sm font-medium text-tm-accent hover:text-tm-accent-hover"
            >
              {category.name}
            </Link>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight text-tm-ink md:text-3xl">
            {product.name}
          </h1>
          <div className="flex flex-wrap items-end gap-3">
            <p className="text-2xl font-bold text-tm-ink">
              {formatPriceUzs(product.priceUzs)}
            </p>
            <p
              className={
                stockStatus === "out"
                  ? "text-sm font-medium text-tm-danger"
                  : stockStatus === "low"
                    ? "text-sm font-medium text-tm-warning"
                    : "text-sm font-medium text-tm-success"
              }
            >
              {formatStockLabel(product.stock)}
            </p>
          </div>
          <p className="max-w-prose text-sm leading-relaxed text-tm-ink-muted">
            {product.description}
          </p>
          <ProductBuyActions productId={product.id} stock={product.stock} />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-tm-ink">
          Характеристики
        </h2>
        <dl className="divide-y divide-tm-border rounded-tm border border-tm-border bg-tm-surface-raised/90 backdrop-blur-sm">
          {product.attributes.map((attr) => (
            <div
              key={`${attr.name}-${attr.value}`}
              className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4"
            >
              <dt className="text-sm text-tm-ink-muted">{attr.name}</dt>
              <dd className="text-sm font-medium text-tm-ink">{attr.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-tm-ink">
            Похожие товары
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
