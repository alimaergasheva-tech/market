"use client";

import Link from "next/link";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTg } from "@/components/tg/TgProvider";
import { useTgMainButton } from "@/components/tg/useTgMainButton";
import { formatPriceUzs } from "@/lib/format";
import { tgFetch } from "@/lib/telegram/client";
import { clearCart, useCartItems } from "@/store/cart-store";
import { useCatalogState } from "@/store/catalog-store";

export default function TgCheckoutPage() {
  const router = useRouter();
  const { user } = useTg();
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
          return {
            product,
            quantity: item.quantity,
            line: product.priceUzs * item.quantity,
          };
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row)),
    [cartItems, products],
  );

  const total = rows.reduce((sum, row) => sum + row.line, 0);

  const submit = useCallback(
    async (form: HTMLFormElement) => {
      setError(null);
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const email = String(data.get("email") || "").trim();
      const address = String(data.get("address") || "").trim();

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
        const orderRes = await tgFetch("/api/orders", {
          method: "POST",
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

        const payRes = await tgFetch(
          "/api/payments/yoomoney/create?return=/tg/payment/result",
          {
            method: "POST",
            body: JSON.stringify({ orderId: orderData.order.id }),
          },
        );
        const payData = (await payRes.json()) as {
          error?: string;
          confirmationUrl?: string;
        };
        if (!payRes.ok || !payData.confirmationUrl) {
          setError(payData.error ?? "Не удалось начать оплату");
          router.push(
            `/tg/payment/result?status=pending&order=${orderData.order.id}`,
          );
          return;
        }

        clearCart();
        window.location.href = payData.confirmationUrl;
      } catch {
        setError("Сеть недоступна");
      } finally {
        setSubmitting(false);
      }
    },
    [rows, router],
  );

  const onMain = useCallback(() => {
    const form = document.getElementById("tg-checkout-form") as HTMLFormElement | null;
    if (form) void submit(form);
  }, [submit]);

  useTgMainButton(
    rows.length > 0 ? `Оплатить · ${formatPriceUzs(total)}` : null,
    rows.length > 0 ? onMain : null,
    { enabled: !submitting, loading: submitting },
  );

  if (status === "loading" || status === "idle") {
    return <p className="py-10 text-center text-sm text-tm-ink-muted">Загрузка…</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-3 text-sm text-tm-ink-muted">
        <p>Нечего оформлять.</p>
        <Link href="/tg/catalog" className="text-tm-accent">
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Оформление</h1>
      <p className="rounded-tm border border-tm-warning/40 bg-tm-surface-raised px-3 py-2 text-xs text-tm-ink">
        Тестовая оплата YooMoney. Карты не запрашиваем.
      </p>

      <form
        id="tg-checkout-form"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          void submit(e.currentTarget);
        }}
        className="space-y-3"
      >
        <Field label="Имя" name="name" defaultValue={user?.name ?? ""} />
        <Field label="Телефон" name="phone" placeholder="+998 ..." />
        <Field label="Email" name="email" type="email" />
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Адрес</span>
          <textarea
            name="address"
            required
            rows={3}
            className="w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3 py-2"
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
          className="inline-flex h-11 w-full items-center justify-center rounded-tm bg-tm-accent text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Создаём…" : "Оплатить"}
        </button>
      </form>

      <aside className="rounded-tm border border-tm-border bg-tm-surface-raised p-3 text-sm">
        <p className="font-semibold">Заказ</p>
        <ul className="mt-2 space-y-1 text-tm-ink-muted">
          {rows.map(({ product, quantity, line }) => (
            <li key={product.id} className="flex justify-between gap-2">
              <span className="line-clamp-1">
                {product.name} × {quantity}
              </span>
              <span className="shrink-0 font-medium text-tm-ink">
                {formatPriceUzs(line)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-tm-border pt-2 font-bold">
          <span>Итого</span>
          <span>{formatPriceUzs(total)}</span>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface-raised px-3"
      />
    </label>
  );
}
