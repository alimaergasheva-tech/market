"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTgMainButton } from "@/components/tg/useTgMainButton";
import {
  findCategoryById,
  relatedProducts,
  toProductCardData,
} from "@/data/catalog-query";
import { ProductCard } from "@/components/product/ProductCard";
import { formatPriceUzs, formatStockLabel, getStockStatus } from "@/lib/format";
import { addToCart } from "@/store/cart-store";
import { useCatalogState } from "@/store/catalog-store";
import { toggleFavorite, useFavoriteIds } from "@/store/favorites-store";
import { toggleCompare } from "@/store/compare-store";

export default function TgProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { products, categories, status } = useCatalogState();
  const favorites = useFavoriteIds();
  const product = products.find((item) => item.slug === slug && item.isActive);

  const onBuy = useCallback(() => {
    if (!product || product.stock <= 0) return;
    addToCart(product.id);
    router.push("/tg/cart");
  }, [product, router]);

  useTgMainButton(
    product && product.stock > 0 ? "В корзину" : null,
    product && product.stock > 0 ? onBuy : null,
  );

  if (status === "loading" || status === "idle") {
    return <p className="py-10 text-center text-sm text-tm-ink-muted">Загрузка…</p>;
  }

  if (!product) {
    return (
      <div className="space-y-3 text-sm">
        <p>Товар не найден</p>
        <Link href="/tg/catalog" className="text-tm-accent">
          В каталог
        </Link>
      </div>
    );
  }

  const category = findCategoryById(categories, product.categoryId);
  const stockStatus = getStockStatus(product.stock);
  const related = relatedProducts(products, product, 4).map((item) =>
    toProductCardData(item, categories),
  );
  const image = product.images[0];

  return (
    <div className="space-y-5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-tm bg-tm-surface-sunken">
        <Image
          src={image?.url ?? "/products/smartphone.jpg"}
          alt={image?.alt || product.name}
          fill
          className="object-cover"
          sizes="(max-width: 512px) 100vw, 512px"
          priority
        />
      </div>

      {category ? (
        <Link
          href={`/tg/category/${category.slug}`}
          className="text-sm font-medium text-tm-accent"
        >
          {category.name}
        </Link>
      ) : null}

      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight">{product.name}</h1>
        <div className="flex flex-wrap items-end gap-3">
          <p className="text-2xl font-bold">{formatPriceUzs(product.priceUzs)}</p>
          <p
            className={
              stockStatus === "out"
                ? "text-sm text-tm-danger"
                : stockStatus === "low"
                  ? "text-sm text-tm-warning"
                  : "text-sm text-tm-success"
            }
          >
            {formatStockLabel(product.stock)}
          </p>
        </div>
        <p className="text-sm leading-relaxed text-tm-ink-muted">
          {product.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          className="h-10 rounded-tm border border-tm-border px-3 text-sm font-medium"
        >
          {favorites.includes(product.id) ? "В избранном" : "В избранное"}
        </button>
        <button
          type="button"
          onClick={() => toggleCompare(product.id)}
          className="h-10 rounded-tm border border-tm-border px-3 text-sm font-medium"
        >
          Сравнить
        </button>
      </div>

      {product.attributes.length > 0 ? (
        <dl className="space-y-2 rounded-tm border border-tm-border bg-tm-surface-raised p-3 text-sm">
          {product.attributes.map((attr) => (
            <div key={attr.name} className="flex justify-between gap-3">
              <dt className="text-tm-ink-muted">{attr.name}</dt>
              <dd className="font-medium text-right">{attr.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {related.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Похожие</h2>
          <div className="grid grid-cols-1 gap-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} basePath="/tg" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
