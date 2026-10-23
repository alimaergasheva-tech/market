"use client";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/StateMessage";
import { ProductCard } from "@/components/product/ProductCard";
import { toProductCardData } from "@/data/catalog-query";
import { clearFavorites, removeFavorite, useFavoriteIds } from "@/store/favorites-store";
import { useCatalogState } from "@/store/catalog-store";

export default function FavoritesPage() {
  const ids = useFavoriteIds();
  const { products, categories, status } = useCatalogState();

  if (status === "loading" || status === "idle") {
    return (
      <div className="tm-container py-16 text-center text-sm text-tm-ink-muted">
        Загрузка избранного…
      </div>
    );
  }

  const cards = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => toProductCardData(item, categories));

  return (
    <div className="tm-container py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Избранное" },
        ]}
      />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-tm-ink md:text-3xl">
          Избранное
        </h1>
        {cards.length > 0 ? (
          <button
            type="button"
            onClick={() => clearFavorites()}
            className="text-sm font-medium text-tm-ink-muted hover:text-tm-danger"
          >
            Очистить
          </button>
        ) : null}
      </div>

      {cards.length === 0 ? (
        <EmptyState
          title="В избранном пока пусто"
          description="Нажмите сердечко на карточке товара, чтобы сохранить его здесь."
          actionHref="/catalog"
          actionLabel="В каталог"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              <button
                type="button"
                onClick={() => removeFavorite(product.id)}
                className="absolute top-2 right-2 z-10 rounded-tm-sm bg-tm-surface-raised/95 px-2 py-1 text-xs font-medium text-tm-ink-muted shadow-tm hover:text-tm-danger"
              >
                Убрать
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
