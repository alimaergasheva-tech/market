"use client";

import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/StateMessage";
import { formatPriceUzs } from "@/lib/format";
import {
  clearCart,
  removeFromCart,
  setCartQuantity,
  useCartItems,
} from "@/store/cart-store";
import { useCatalogState } from "@/store/catalog-store";

export default function CartPage() {
  const items = useCartItems();
  const { products, status } = useCatalogState();
  const rows = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return { item, product, lineTotal: product.priceUzs * item.quantity };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (status === "loading" || status === "idle") {
    return (
      <div className="tm-container py-16 text-center text-sm text-tm-ink-muted">
        Загрузка корзины…
      </div>
    );
  }

  const subtotal = rows.reduce((sum, row) => sum + row.lineTotal, 0);

  return (
    <div className="tm-container py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Корзина" },
        ]}
      />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-tm-ink md:text-3xl">
          Корзина
        </h1>
        {rows.length > 0 ? (
          <button
            type="button"
            onClick={() => clearCart()}
            className="text-sm font-medium text-tm-ink-muted hover:text-tm-danger"
          >
            Очистить корзину
          </button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Корзина пуста"
          description="Добавьте товары из каталога, чтобы оформить заказ."
          actionHref="/catalog"
          actionLabel="В каталог"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <ul className="divide-y divide-tm-border rounded-tm border border-tm-border bg-tm-surface-raised">
            {rows.map(({ item, product, lineTotal }) => (
              <li key={product.id} className="flex flex-col gap-4 p-4 sm:flex-row">
                <Link
                  href={`/product/${product.slug}`}
                  className="relative h-24 w-full shrink-0 overflow-hidden rounded-tm-sm bg-tm-surface-sunken sm:w-28"
                >
                  <Image
                    src={product.images[0]?.url ?? "/products/smartphone.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </Link>
                <div className="min-w-0 flex-1 space-y-2">
                  <Link
                    href={`/product/${product.slug}`}
                    className="font-semibold text-tm-ink hover:text-tm-accent"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-tm-ink-muted">
                    {formatPriceUzs(product.priceUzs)} за шт.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      Кол-во
                      <input
                        type="number"
                        min={1}
                        max={product.stock}
                        value={item.quantity}
                        onChange={(event) =>
                          setCartQuantity(
                            product.id,
                            Number(event.target.value) || 1,
                          )
                        }
                        className="h-9 w-16 rounded-tm-sm border border-tm-border bg-tm-surface px-2"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="text-sm text-tm-ink-muted hover:text-tm-danger"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                <p className="text-base font-bold text-tm-ink sm:text-right">
                  {formatPriceUzs(lineTotal)}
                </p>
              </li>
            ))}
          </ul>

          <aside className="h-fit space-y-4 rounded-tm border border-tm-border bg-tm-surface-raised p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-tm-ink-muted">Итого</span>
              <span className="text-lg font-bold text-tm-ink">
                {formatPriceUzs(subtotal)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="inline-flex h-11 w-full items-center justify-center rounded-tm bg-tm-accent text-sm font-semibold text-white hover:bg-tm-accent-hover active:scale-[0.98]"
            >
              Оформить заказ
            </Link>
            <p className="text-xs text-tm-ink-subtle">
              Оплата тестовая. Реальные деньги не списываются.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
