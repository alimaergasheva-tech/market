"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/StateMessage";
import { formatPriceUzs } from "@/lib/format";
import { useAuth } from "@/store/auth-store";
import { clearCart, useCartItems } from "@/store/cart-store";
import { useCatalogState } from "@/store/catalog-store";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const cartItems = useCartItems();
  const { products, status } = useCatalogState();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const rows = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return null;
          return { product, quantity: item.quantity, line: product.priceUzs * item.quantity };
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row)),
    [cartItems, products],
  );

  const total = rows.reduce((sum, row) => sum + row.line, 0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const email = String(form.get("email") || "").trim();
    const address = String(form.get("address") || "").trim();

    if (!name || !phone || !email.includes("@") || !address) {
      setError("Заполните все поля корректно.");
      return;
    }

    if (rows.length === 0) {
      setError("Корзина пуста.");
      return;
    }

    setSubmitting(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          deliveryAddress: address,
          items: rows.map((row) => ({
            productId: row.product.id,
            quantity: row.quantity,
          })),
        }),
      });
      const orderData = (await orderRes.json()) as {
        error?: string;
        order?: { id: string };
      };
      if (!orderRes.ok || !orderData.order) {
        setError(orderData.error ?? "Не удалось создать заказ");
        return;
      }

      const payRes = await fetch("/api/payments/yoomoney/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.order.id }),
      });
      const payData = (await payRes.json()) as {
        error?: string;
        confirmationUrl?: string;
      };
      if (!payRes.ok || !payData.confirmationUrl) {
        setError(payData.error ?? "Не удалось начать оплату");
        router.push(
          `/payment/result?status=pending&order=${orderData.order.id}`,
        );
        return;
      }

      clearCart();
      window.location.href = payData.confirmationUrl;
    } catch {
      setError("Сеть недоступна. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || status === "idle") {
    return (
      <div className="tm-container py-16 text-center text-sm text-tm-ink-muted">
        Загрузка оформления…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="tm-container py-6 md:py-8">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Оформление" },
          ]}
        />
        <EmptyState
          title="Нечего оформлять"
          description="Сначала добавьте товары в корзину."
          actionHref="/catalog"
          actionLabel="В каталог"
        />
      </div>
    );
  }

  return (
    <div className="tm-container py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Корзина", href: "/cart" },
          { label: "Оформление" },
        ]}
      />
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-tm-ink md:text-3xl">
        Оформление заказа
      </h1>

      <div className="mb-4 rounded-tm border border-tm-warning/40 bg-tm-surface-raised px-4 py-3 text-sm text-tm-ink">
        Оплата тестовая (YooMoney simulate). Реальные деньги не списываются, данные карт не запрашиваем.
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-tm border border-tm-border bg-tm-surface-raised p-5"
        >
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-tm-ink">Имя</span>
            <input
              name="name"
              required
              defaultValue={user?.name ?? ""}
              className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface px-3"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-tm-ink">Телефон</span>
            <input
              name="phone"
              required
              placeholder="+998 ..."
              className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface px-3"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-tm-ink">Email</span>
            <input
              name="email"
              type="email"
              required
              defaultValue={user?.email ?? ""}
              className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface px-3"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-tm-ink">Адрес доставки</span>
            <textarea
              name="address"
              required
              rows={3}
              className="w-full rounded-tm border border-tm-border bg-tm-surface px-3 py-2"
            />
          </label>
          {error ? (
            <p className="text-sm text-tm-danger" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-tm bg-tm-accent text-sm font-semibold text-white hover:bg-tm-accent-hover active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? "Создаём заказ…" : "Перейти к тестовой оплате"}
          </button>
          <p className="text-xs text-tm-ink-subtle">
            Нет аккаунта? Можно оформить как гость или{" "}
            <Link href="/login" className="text-tm-accent">
              войти
            </Link>
            .
          </p>
        </form>

        <aside className="h-fit space-y-3 rounded-tm border border-tm-border bg-tm-surface-raised p-4">
          <p className="font-semibold text-tm-ink">Ваш заказ</p>
          <ul className="space-y-2 text-sm">
            {rows.map(({ product, quantity, line }) => (
              <li key={product.id} className="flex justify-between gap-3 text-tm-ink-muted">
                <span className="line-clamp-2">
                  {product.name} × {quantity}
                </span>
                <span className="shrink-0 font-medium text-tm-ink">
                  {formatPriceUzs(line)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-tm-border pt-3">
            <span className="text-sm text-tm-ink-muted">Итого</span>
            <span className="font-bold text-tm-ink">{formatPriceUzs(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
